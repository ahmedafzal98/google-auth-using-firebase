import "./App.css";
import HomePage from "./pages/HomePage";
import ArticleEditor from "./pages/ArticleEditor";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Route for the homepage */}
          <Route path="/" element={<HomePage />} />

          {/* Route for the article editor page */}
          <Route path="/write-article" element={<ArticleEditor />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
