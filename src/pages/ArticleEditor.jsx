import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./ArticleEditor.css";
import { auth, db } from "../firebase/firebaseConfig";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

const ArticleEditor = () => {
  const [userId, setUserId] = useState();
  const [article, setArticle] = useState({
    title: "",
    content: "",
    media: [],
  });

  useEffect(() => {
    if (auth.currentUser) {
      setUserId(auth.currentUser.uid);
    }
  }, []);

  const intervalId = useRef(null);
  const lastArticleRef = useRef(null);
  // localStorage.setItem("userId", userId);

  // const userID = localStorage.getItem("userId");
  // const articleData = localStorage.getItem(`draft_${userId}`);

  // console.log("UserId", userID);
  // console.log("articleDate", articleData);

  const handleChange = (field, value) => {
    setArticle((prevArticle) => ({
      ...prevArticle,
      [field]: value,
    }));
  };

  useEffect(() => {
    const createDraftColl = async () => {
      const draftsCollectionRef = collection(db, "users", userId, "drafts");
      await addDoc(draftsCollectionRef, {
        ...article,
        timestamp: new Date().toISOString(),
      });
    };

    createDraftColl();
  }, []);
  const saveDraft = async () => {
    if (!userId || !article.title || !article.content) return;

    if (lastArticleRef.current !== JSON.stringify(article)) {
      try {
        const drafts = await getAllDrafts(userId);

        const draftId = drafts[0]?.draftId;

        if (!draftId) return;

        const draftDocRef = doc(db, "users", userId, "drafts", draftId);

        await updateDoc(draftDocRef, {
          ...article,
          timestamp: new Date().toISOString(),
        });
        console.log("Draft saved successfully!");

        // Update the last saved article reference
        lastArticleRef.current = JSON.stringify(article);
      } catch (error) {
        console.error("Error saving draft: ", error);
      }
    }
  };

  const getAllDrafts = async (userId) => {
    try {
      const draftsCollectionRef = collection(db, "users", userId, "drafts");
      const draftsSnapshot = await getDocs(draftsCollectionRef);

      // Extract document IDs and data
      const drafts = draftsSnapshot.docs.map((doc) => ({
        draftId: doc.id, // The Firestore-generated document ID
        ...doc.data(), // The draft data
      }));

      console.log("Drafts: ", drafts);
      return drafts;
    } catch (error) {
      console.error("Error fetching drafts: ", error);
    }
  };

  useEffect(() => {
    if (article && article !== lastArticleRef.current) {
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }

      // Set a new interval to save the draft every 2 seconds
      intervalId.current = setInterval(() => {
        saveDraft(); // Save draft to Firestore
      }, 2000);

      // Update the reference to the latest article
      lastArticleRef.current = article;
    }

    // Cleanup the interval when the component unmounts or article changes
    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
        intervalId.current = null;
      }
    };
  }, [article, userId]);

  const handleSubmit = async () => {
    try {
      const articlesCollectionRef = collection(db, "articles");
      await addDoc(articlesCollectionRef, {
        ...article,
        userId,
        timestamp: new Date().toISOString(),
      });

      console.log("Article submitted successfully!");
    } catch (error) {
      console.error("Error submitting article: ", error);
    }
  };
  return (
    <div className="article-editor">
      <h1 className="editor-title">Create a New Article</h1>

      <div className="input-section">
        <label>Title</label>
        <input
          type="text"
          placeholder="Enter article title"
          value={article.title}
          onChange={(e) => handleChange("title", e.target.value)}
        />
      </div>

      <div className="input-section">
        <label>Article Content</label>
        <ReactQuill
          placeholder="Write Your Content!"
          value={article.content}
          onChange={(content) => handleChange("content", content)}
        />
      </div>

      <div className="dropzone">
        <input />
        <p>Drag & drop an image or video here, or click to select one</p>
      </div>

      {/* {article.media && (
        <div className="media-preview">
          {mediaType === "image" ? (
            <img alt="media-preview" className="media-preview-img" />
          ) : (
            <video controls className="media-preview-video" />
          )}
          <button
            className="remove-media-button"
            onClick={() => setMedia(null)}
          >
            Remove
          </button>
        </div>
      )} */}

      <div>
        <button className="save-draft-button">Save as Draft</button>
        <button className="submit-button" onClick={handleSubmit}>
          Submit Article
        </button>
      </div>
    </div>
  );
};

export default ArticleEditor;
