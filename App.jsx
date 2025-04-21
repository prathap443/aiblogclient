// src/App.jsx
import { useState } from "react";

function App() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Demo function - doesn't use Firebase
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!summary.trim()) newErrors.summary = "Summary is required";
    if (!content.trim()) newErrors.content = "Content is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Create a local post instead of using Firebase
    const newPost = {
      id: Date.now().toString(),
      title,
      summary,
      content,
      createdAt: new Date().toISOString()
    };
    
    setPosts([newPost, ...posts]);
    setTitle("");
    setSummary("");
    setContent("");
  };

  const deletePost = (id) => {
    // Don't use window.confirm which might cause SSR issues
    setPosts(posts.filter(p => p.id !== id));
  };

  return (
    <div className="app-background">
      <div className="container">
        <h1 className="title">🧠 Prathap's AI Blog</h1>

        <form onSubmit={handleSubmit} className="post-form">
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {errors.title && <p className="error">{errors.title}</p>}

          <input
            placeholder="Summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
          {errors.summary && <p className="error">{errors.summary}</p>}

          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          {errors.content && <p className="error">{errors.content}</p>}

          <button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create Post"}
          </button>
        </form>

        <div className="posts">
          {loading ? (
            <p>Loading posts...</p>
          ) : posts.length === 0 ? (
            <p>No posts yet. Start writing!</p>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="post">
                <h3>{post.title}</h3>
                <p className="summary">{post.summary}</p>
                <p>{post.content}</p>
                <button onClick={() => deletePost(post.id)}>🗑️ Delete</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;