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
  const [error, setError] = useState(null);

  // Debug logging
  console.log("App component rendering");

  // Check if Firebase is properly configured
  useEffect(() => {
    console.log("Checking Firebase availability");
    try {
      // Adding more detailed check for Firestore
      if (db && typeof db.collection === 'function') {
        console.log("Firebase appears to be available");
        setFirebaseAvailable(true);
      } else {
        console.log("Firebase methods not detected");
        setFirebaseAvailable(false);
      }
    } catch (err) {
      console.warn("Firebase not fully initialized:", err);
      setFirebaseAvailable(false);
    }
  }, []);

  // Collection reference with null check
  const getPostsCollection = () => {
    try {
      if (firebaseAvailable) {
        return collection(db, "posts");
      }
      return null;
    } catch (err) {
      console.error("Error creating posts collection reference:", err);
      return null;
    }
  };

  const fetchPosts = async () => {
    console.log("Attempting to fetch posts");
    setLoading(true);
    try {
      if (!firebaseAvailable) {
        console.warn("Skipping fetchPosts: Firebase not available");
        setLoading(false);
        return;
      }

      const postsCollection = getPostsCollection();
      if (!postsCollection) {
        console.warn("Posts collection reference is null");
        setLoading(false);
        return;
      }

      console.log("Creating Firestore query");
      const q = query(postsCollection, orderBy("createdAt", "desc"));
      console.log("Executing query");
      const snapshot = await getDocs(q);
      console.log("Got documents, mapping data");
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      console.log("Setting posts:", data.length);
      setPosts(data);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts: " + err.message);
      // Fall back to empty posts array on error
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Firebase availability changed:", firebaseAvailable);
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

    console.log("Form submitted");

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
        console.log("Creating local post");
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

      console.log("Creating Firestore post");
      const postsCollection = getPostsCollection();
      const docRef = await addDoc(postsCollection, {
        title,
        summary,
        content,
        createdAt: serverTimestamp(),
      });

      console.log("Post created with ID:", docRef.id);
      setPosts([{ id: docRef.id, title, summary, content }, ...posts]);
      setTitle("");
      setSummary("");
      setContent("");
      alert("Post created successfully!");
    } catch (err) {
      console.error("Error adding document:", err);
      alert("Failed to create post: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const deletePost = async (id) => {
    console.log("Attempting to delete post:", id);
    
    // Use a safer deletion confirmation approach
    const confirmDelete = window && typeof window.confirm === 'function' 
      ? window.confirm("Are you sure you want to delete this post?") 
      : true;
      
    if (!confirmDelete) return;
    
    try {
      if (!firebaseAvailable) {
        console.log("Deleting local post");
        // Local fallback if Firebase isn't available
        setPosts(posts.filter(p => p.id !== id));
        return;
      }

      console.log("Deleting Firestore post");
      await deleteDoc(doc(db, "posts", id));
      setPosts(posts.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete post: " + err.message);
    }
  };

  // Debug what's rendering
  console.log("Current state:", { 
    postsCount: posts.length, 
    loading, 
    firebaseAvailable,
    error 
  });

  return (
    <div className="app-background">
      <div className="container">
        <h1 className="title">🧠 Prathap's AI Blog</h1>
        
        {/* Show any errors that occurred */}
        {error && (
          <div style={{ 
            padding: "0.75rem", 
            marginBottom: "1rem", 
            background: "#f8d7da", 
            color: "#721c24",
            borderRadius: "8px",
            border: "1px solid #f5c6cb"
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}
        
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