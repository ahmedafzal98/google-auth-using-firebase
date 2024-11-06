import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useDropzone } from "react-dropzone";
import "./ArticleEditor.css";
import { auth, firestore, storage } from "../firebase/firebaseConfig"; // Add storage import
import { addDoc, collection, doc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import Firebase Storage functions

const ArticleEditor = () => {
  const [title, setTitle] = useState("");
  const [editorValue, setEditorValue] = useState("");
  const [media, setMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null); // Store file type separately

  const onEditorChange = (value) => {
    setEditorValue(value);
  };

  // Handle file upload
  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*,video/*",
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setMedia(file);
        setMediaType(file.type.startsWith("image") ? "image" : "video"); // Set media type
      }
    },
  });

  const handleRemoveMedia = () => {
    setMedia(null);
    setMediaType(null);
  };

  const handleSubmit = async () => {
    const user = auth.currentUser;

    if (user) {
      // Handle the media upload first
      let mediaUrl = null;

      if (media) {
        // Create a reference to Firebase Storage
        const mediaRef = ref(storage, `articles/${user.uid}/${media.name}`);

        try {
          // Upload the file to Firebase Storage
          const uploadResult = await uploadBytes(mediaRef, media);
          // Get the download URL for the uploaded file
          mediaUrl = await getDownloadURL(uploadResult.ref);
          console.log("Media uploaded successfully!");
        } catch (error) {
          console.error("Error uploading media: ", error);
        }
      }

      // Prepare the article data with the media URL from Firebase Storage
      const articleData = {
        title,
        content: editorValue,
        mediaUrl, // Use the URL from Firebase Storage
        mediaType,
        timestamp: Timestamp.now(),
      };

      try {
        const articlesCollectionRef = collection(
          doc(firestore, "users", user.uid),
          "articles"
        );

        await addDoc(articlesCollectionRef, articleData);

        console.log("Article successfully added to Firestore!");
        setTitle("");
        setEditorValue("");
        handleRemoveMedia();
      } catch (error) {
        console.error("Error adding article: ", error);
      }
    } else {
      console.log("No user is signed in.");
    }
  };

  return (
    <div className="article-editor">
      <h1 className="editor-title">Create a New Article</h1>

      {/* Title Section */}
      <div className="input-section">
        <label>Title</label>
        <input
          type="text"
          placeholder="Enter article title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Body Section */}
      <div className="input-section">
        <label>Article Content</label>
        <ReactQuill value={editorValue} onChange={onEditorChange} />
      </div>

      {/* Media Upload Section */}
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <p>Drag & drop an image or video here, or click to select one</p>
      </div>

      {/* Media Preview */}
      {media && (
        <div className="media-preview">
          {mediaType === "image" ? (
            <img
              src={URL.createObjectURL(media)} // Use object URL to preview before upload
              alt="media-preview"
              className="media-preview-img"
            />
          ) : (
            <video
              src={URL.createObjectURL(media)}
              controls
              className="media-preview-video"
            />
          )}
          <button className="remove-media-button" onClick={handleRemoveMedia}>
            Remove
          </button>
        </div>
      )}

      {/* Submit Button */}
      <div>
        <button className="submit-button" onClick={handleSubmit}>
          Submit Article
        </button>
      </div>
    </div>
  );
};

export default ArticleEditor;
