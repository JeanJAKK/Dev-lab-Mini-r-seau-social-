import { useEffect, useState } from "react";
import supabase from "../services/supabase";
import "./Feed.css";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("posts")
      .select(`
        id,
        title,
        content,
        image_url,
        created_at,
        profiles (
          name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setError("Erreur lors du chargement des posts");
    } else {
      setPosts(data);
    }

    setLoading(false);
  };

  if (loading) return <p>Chargement du fil...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="feed-page">
      <h2>Fil d’actualité</h2>

      {posts.length === 0 && <p>Aucun post pour le moment</p>}

      <div className="posts-list">
        {posts.map((post) => (
          <div className="post-card" key={post.id}>

            {/* Auteur + date */}
            <div className="post-header">
              <strong>{post.profiles?.name || "Utilisateur inconnu"}</strong>
              <span className="post-date">
                {new Date(post.created_at).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>

            {post.image_url && (
              <img
                src={post.image_url}
                alt="post"
                className="post-image"
              />
            )}

            <h3>{post.title}</h3>
            <p>{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
