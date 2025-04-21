// src/App.jsx (Firebase version)
import { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy
} from "firebase/firestore";

function App() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const postsCollection = collection(db, "posts");

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const q = query(postsCollection, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPosts(data);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!summary.trim()) newErrors.summary = "Summary is required";
    if (!content.trim()) newErrors.content = "Content is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitting(false);
      return;
    }

    try {
      const docRef = await addDoc(postsCollection, {
        title,
        summary,
        content,
        createdAt: serverTimestamp()
      });

      setPosts([{ id: docRef.id, title, summary, content }, ...posts]);
      setTitle("");
      setSummary("");
      setContent("");
      alert("Post created successfully!");
    } catch (err) {
      console.error("Error adding document:", err);
      alert("Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  const deletePost = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteDoc(doc(db, "posts", id));
      setPosts(posts.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete post");
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Segoe UI", maxWidth: 800, margin: "0 auto" }}>
      <h1>🧠 Prathap's AI Blog</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: "1rem" }}
        />
        {errors.title && <p style={{ color: "red" }}>{errors.title}</p>}

        <input
          placeholder="Summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          style={{ display: "block", width: "100%", marginBottom: "1rem" }}
        />
        {errors.summary && <p style={{ color: "red" }}>{errors.summary}</p>}

        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ display: "block", width: "100%", minHeight: 100, marginBottom: "1rem" }}
        />
        {errors.content && <p style={{ color: "red" }}>{errors.content}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create Post"}
        </button>
      </form>

      {loading ? (
        <p>Loading posts...</p>
      ) : posts.length === 0 ? (
        <p>No posts yet. Start writing!</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} style={{ padding: "1rem", borderBottom: "1px solid #ddd" }}>
            <h3>{post.title}</h3>
            <p><strong>{post.summary}</strong></p>
            <p>{post.content}</p>
            <button onClick={() => deletePost(post.id)}>🗑️ Delete</button>
          </div>
        ))
      )}
    </div>
  );
}

export default App;
