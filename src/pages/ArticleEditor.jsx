import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebaseConfig";
import { addDoc, collection, doc, Timestamp } from "firebase/firestore";
import "./ArticleEditor.css";

const ArticleEditor = () => {
  const [title, setTitle] = useState("");
  const [editorValue, setEditorValue] = useState("");
  const [media, setMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [isBlocking, setIsBlocking] = useState(false); // Tracks unsaved changes

  const navigate = useNavigate();
  const user = auth.currentUser;

  // Save the draft to Firestore
  const saveDraft = async () => {
    if (user) {
      const articleData = {
        title,
        content: editorValue,
        mediaUrl: media ? URL.createObjectURL(media) : null, // Use local URL
        mediaType,
        timestamp: Timestamp.now(),
      };

      try {
        // Save to the 'drafts' collection under the user's ID
        const draftsCollectionRef = collection(db, "users", user.uid, "drafts");

        await addDoc(draftsCollectionRef, articleData);

        console.log("Article successfully saved as draft!");
        setIsBlocking(false); // After saving, no longer block navigation
      } catch (error) {
        console.error("Error saving article to drafts: ", error);
      }
    } else {
      console.log("No user is signed in.");
    }
  };

  const handleSubmit = async () => {
    if (user) {
      const articleData = {
        title,
        content: editorValue,
        mediaUrl: media ? URL.createObjectURL(media) : null, // Use local URL
        mediaType,
        timestamp: Timestamp.now(),
      };

      try {
        // Save to the 'articles' collection under the user's ID
        const articlesCollectionRef = collection(
          db,
          "users",
          user.uid,
          "articles"
        );

        await addDoc(articlesCollectionRef, articleData);

        console.log("Article successfully added to Firestore!");
        setTitle("");
        setEditorValue("");
        setMedia(null);
        setIsBlocking(false); // After submission, clear blocking state
      } catch (error) {
        console.error("Error adding article: ", error);
      }
    } else {
      console.log("No user is signed in.");
    }
  };

  const handleChange = (field, value) => {
    setIsBlocking(true); // Enable blocking when there is unsaved input
    if (field === "title") setTitle(value);
    if (field === "content") setEditorValue(value);
  };

  // Custom hook to block navigation
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isBlocking) {
        saveDraft();
        const message =
          "You have unsaved changes. Do you want to leave without saving?";
        event.returnValue = message; // Standard for most browsers
        return message; // Some browsers require this
      }
    };

    const handleNavigation = (event) => {
      if (isBlocking) {
        const confirmLeave = window.confirm(
          "You have unsaved changes. Do you want to leave without saving?"
        );
        if (!confirmLeave) {
          event.preventDefault(); // Prevent the navigation
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handleNavigation); // Handle browser navigation (back/forward)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handleNavigation);
    };
  }, [isBlocking]);

  // Media dropzone
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
      "video/*": [".mp4", ".avi", ".mov"],
    },
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setMedia(file);
        setMediaType(file.type.startsWith("image") ? "image" : "video");
        setIsBlocking(true);
      }
    },
  });

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
          onChange={(e) => handleChange("title", e.target.value)}
        />
      </div>

      {/* Body Section */}
      <div className="input-section">
        <label>Article Content</label>
        <ReactQuill
          placeholder="Write Your Content!"
          value={editorValue}
          onChange={(content) => handleChange("content", content)}
        />
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
              src={URL.createObjectURL(media)}
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
          <button
            className="remove-media-button"
            onClick={() => setMedia(null)}
          >
            Remove
          </button>
        </div>
      )}

      {/* Buttons */}
      <div>
        <button className="save-draft-button" onClick={saveDraft}>
          Save as Draft
        </button>
        <button className="submit-button" onClick={handleSubmit}>
          Submit Article
        </button>
      </div>
    </div>
  );
};

export default ArticleEditor;
