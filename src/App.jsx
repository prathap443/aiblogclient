// src/App.jsx
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
  orderBy,
} from "firebase/firestore";
//import bg from "./assets/bg.jpg";
import "./style.css";

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
        createdAt: serverTimestamp(),
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
    <div
      className="app-background"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
      }}
    >
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
