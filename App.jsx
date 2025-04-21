// src/App.jsx - Simple version without Firebase
import { useState } from "react";

function App() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const newPost = {
      id: Date.now().toString(),
      title,
      summary,
      content
    };
    setPosts([newPost, ...posts]);
    setTitle("");
    setSummary("");
    setContent("");
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

          <input
            placeholder="Summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />

          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <button type="submit">Create Post</button>
        </form>

        <div className="posts">
          {posts.length === 0 ? (
            <p>No posts yet. Start writing!</p>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="post">
                <h3>{post.title}</h3>
                <p className="summary">{post.summary}</p>
                <p>{post.content}</p>
                <button onClick={() => setPosts(posts.filter(p => p.id !== post.id))}>
                  🗑️ Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;