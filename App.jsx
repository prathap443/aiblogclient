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

function App() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [firebaseAvailable, setFirebaseAvailable] = useState(false);

  // Check if Firebase is properly configured
  useEffect(() => {
    try {
      // Simple check if db is a functional Firestore instance
      if (db && typeof db.collection === 'function') {
        setFirebaseAvailable(true);
      }
    } catch (err) {
      console.warn("Firebase not fully initialized:", err);
      setFirebaseAvailable(false);
    }
  }, []);

  // Collection reference with null check
  const postsCollection = firebaseAvailable ? collection(db, "posts") : null;

  const fetchPosts = async () => {
    setLoading(true);
    try {
      if (!firebaseAvailable) {
        console.warn("Skipping fetchPosts: Firebase not available");
        setLoading(false);
        return;
      }

      const q = query(postsCollection, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPosts(data);
    } catch (err) {
      console.error("Error fetching posts:", err);
      // Fall back to empty posts array on error
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (firebaseAvailable) {
      fetchPosts();
    } else {
      // If Firebase is not available, stop loading state
      setLoading(false);
    }
  }, [firebaseAvailable]);

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
      if (!firebaseAvailable) {
        // Local fallback if Firebase isn't available
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
        alert("Post created locally (Firebase not connected)");
        setSubmitting(false);
        return;
      }

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
    // Use a safer deletion confirmation approach
    const confirmDelete = window && typeof window.confirm === 'function' 
      ? window.confirm("Are you sure you want to delete this post?") 
      : true;
      
    if (!confirmDelete) return;
    
    try {
      if (!firebaseAvailable) {
        // Local fallback if Firebase isn't available
        setPosts(posts.filter(p => p.id !== id));
        return;
      }

      await deleteDoc(doc(db, "posts", id));
      setPosts(posts.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete post");
    }
  };

  return (
    <div className="app-background">
      <div className="container">
        <h1 className="title">🧠 Prathap's AI Blog</h1>
        
        {!firebaseAvailable && (
          <div style={{ 
            padding: "0.75rem", 
            marginBottom: "1rem", 
            background: "#fff3cd", 
            color: "#856404",
            borderRadius: "8px",
            border: "1px solid #ffeeba"
          }}>
            <strong>Notice:</strong> Running in local mode. Posts will not be saved to Firebase.
          </div>
        )}

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