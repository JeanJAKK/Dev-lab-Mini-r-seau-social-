import { useEffect, useState } from "react";
import supabase from "../services/supabase";
import "./Posts.css";

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setMessage("❌ Erreur lors du chargement des posts");
        console.error(error);
      } else {
        setPosts(data);
      }

      setLoading(false);
    };

    fetchPosts();
  }, []);

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="posts-page">
      <h2>Fil d’actualité</h2>

      {message && <p>{message}</p>}

      {posts.length === 0 && <p>Aucun post pour le moment.</p>}

      {posts.map((post) => (
        <div className="post-card" key={post.id}>
          <h3>{post.title}</h3>

          {post.image_url && (
            <img src={post.image_url} alt={post.title} />
          )}

          <p>{post.content}</p>

          <span className="date">
            {new Date(post.created_at).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
