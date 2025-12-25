import { useEffect, useState } from "react";
import supabase from "../services/supabase";
import "./Posts.css";

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError("Erreur lors du chargement des posts");
      setLoading(false);
      return;
    }

    setPosts(data);
    setLoading(false);
  };

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="posts-page">
      <h2>Fil d’actualité</h2>

      <div className="posts-list">
        {posts.length === 0 && <p>Aucun post pour le moment.</p>}

        {posts.map((post) => (
          <div className="post-card" key={post.id}>
            <h3>{post.title}</h3>

            {post.image_url && (
              <img src={post.image_url} alt="post" />
            )}

            <p>{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
