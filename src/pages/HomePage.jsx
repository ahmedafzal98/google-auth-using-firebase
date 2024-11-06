import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase/firebaseConfig";
import {
  getFirestore,
  collection,
  query,
  getDocs,
  doc,
} from "firebase/firestore";
import "./HomePage.css";
import Login from "../Login/Login";

const db = getFirestore();

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        fetchArticles(user.uid); // Fetch articles when user is authenticated
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchArticles = async (userId) => {
    try {
      const articlesRef = collection(doc(db, "users", userId), "articles");
      const articlesSnapshot = await getDocs(query(articlesRef));
      const articlesData = articlesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setArticles(articlesData);
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
  };

  return (
    <div className="homepage">
      {user ? (
        <>
          <div className="header">
            <h2>Welcome, {user.displayName}</h2>
            <button onClick={() => auth.signOut()}>Sign Out</button>
            <Link to="/write-article">
              <button>Write Article</button>
            </Link>
          </div>

          <div className="articles-container">
            {articles.length > 0 ? (
              articles.map((article) => (
                <div className="article-card" key={article.id}>
                  {/* Conditionally render media based on mediaType */}
                  {article.mediaUrl &&
                    (article.mediaType === "image" ? (
                      <img
                        src={article.mediaUrl}
                        alt="Article Media"
                        className="article-media"
                      />
                    ) : (
                      <video
                        src={article.mediaUrl}
                        controls
                        className="article-media"
                      />
                    ))}
                  <div className="article-content">
                    <h3>{article.title}</h3>
                    {/* Render content as HTML */}
                    <div
                      dangerouslySetInnerHTML={{ __html: article.content }}
                      className="article-body"
                    />
                  </div>
                </div>
              ))
            ) : (
              <p>No articles to display</p>
            )}
          </div>
        </>
      ) : (
        <Login />
      )}
    </div>
  );
};

export default HomePage;
