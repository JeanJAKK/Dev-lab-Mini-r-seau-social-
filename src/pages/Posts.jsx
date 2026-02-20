import { useEffect, useState } from "react";
import supabase from "../services/supabase";
import "./Posts.css";
import { User } from "lucide-react";

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [modalImage, setModalImage] = useState(null); // Image en modale

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setMessage("Erreur lors du chargement des posts");
        console.error(error);
      } else {
        setPosts(data);
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

  if (loading) return <p className="loading">Chargement...</p>;

  const openModal = (imageUrl) => setModalImage(imageUrl);
  const closeModal = () => setModalImage(null);

  return (
    <div className="posts-page">
      <div className="posts-container">
        <h2 className="posts-title">Fil d'actualité</h2>

        {message && <p className="message">{message}</p>}
        {posts.length === 0 && <p className="empty-message">Aucun post pour le moment.</p>}

        {posts.map((post) => (
          <div className="post-card" key={post.id}>
            <div className="post-header">
              <div className="user-avatar"><User size={20} /></div>
              <div className="post-meta">
                <h3 className="post-title">{post.title}</h3>
                <span className="post-date">{new Date(post.created_at).toLocaleString()}</span>
              </div>
            </div>

            {post.image_url && (
              <img
                src={post.image_url}
                alt={post.title}
                className="post-image"
                onClick={() => openModal(post.image_url)}
              />
            )}

            <p className="post-content">{post.content}</p>
          </div>
        ))}

        {/* Modale */}
        {modalImage && (
          <div className="image-modal" onClick={closeModal}>
            <img src={modalImage} alt="Agrandie" />
            <button
  className="download-btn"
  onClick={async (e) => {
    e.stopPropagation(); // empêcher la fermeture de la modale
    try {
      const response = await fetch(modalImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "image.jpg"; // tu peux mettre le nom que tu veux
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url); // libérer la mémoire
    } catch (error) {
      console.error("Erreur lors du téléchargement :", error);
      alert("Impossible de télécharger l'image.");
    }
  }}
>
  Télécharger
</button>
          </div>
        )}
      </div>
    </div>
  );
}