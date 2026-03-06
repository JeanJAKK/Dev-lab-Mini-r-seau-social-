import { useEffect, useState } from "react";
import supabase from "../services/supabase";
import "./Posts.css";
import { User, Heart, MessageCircle, Share2 } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { getPostLikes } from "../services/systemeLike/getPostLikes";
import { getUserId } from "../services/systemeLike/getUser";
import { like } from "../services/systemeLike/Like";

function PostImage({ src, alt, onClick }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="post-image-wrapper">
      {!loaded && <div className="post-image-skeleton" />}
      <img
        src={src}
        alt={alt}
        className="post-image"
        onClick={onClick}
        onLoad={() => setLoaded(true)}
        style={
          loaded
            ? { opacity: 1 }
            : {
                position: "absolute",
                opacity: 0,
                width: "1px",
                height: "1px",
                pointerEvents: "none",
              }
        }
      />
    </div>
  );
}
const handleLike = async (postId, userId, liked) => {
  const newCount = await like(postId, userId, liked);

  // Mettre à jour l'état local
  setPosts((prevPosts) =>
    prevPosts.map((post) =>
      post.id === postId ? { ...post, likes: newCount, liked: !liked } : post,
    ),
  );
};
export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [modalImage, setModalImage] = useState(null);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const { theme } = useTheme();
  const [user] = useState({
    full_name: "Sophie Martin",
    email: "sophie.martin@example.com",
    avatar_url: "https://i.pravatar.cc/300",
  });

  const displayName = user.full_name;
  const avatarUrl =
    user.avatar_url ||
    `https://ui-avatars.com/api/?name=${displayName}&background=random`;

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*, profiles!posts_user_id_fkey(name)")
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

  if (loading) return <p className="loading">Chargement...</p>;

  const openModal = (imageUrl) => setModalImage(imageUrl);
  const closeModal = () => setModalImage(null);

  return (
    <div className="posts-page" data-theme={theme}>
      <div className="posts-container">
        <h2 className="posts-title">Fil d'actualité</h2>

        {message && <p className="message">{message}</p>}
        {posts.length === 0 && (
          <p className="empty-message">Aucun post pour le moment.</p>
        )}

        {posts.map((post) => (
          <div className="post-card" key={post.id}>
            <div className="post-header">
              <div className="user-avatar">
                <img
                  src={avatarUrl}
                  alt="profile"
                  className="w-10 h-10 rounded-full border-2 object-cover"
                />
              </div>
              <div className="post-meta">
                <h3 className="post-username">{post.profiles?.name}</h3>
                <span className="post-date">
                  {new Date(post.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            {post.image_url && (
              <PostImage
                src={post.image_url}
                alt={post.title}
                onClick={() => openModal(post.image_url)}
              />
            )}

            <p className="post-content">{post.content}</p>

            <div className="post-actions">
              <button
                className={`post-action-btn ${post.liked ? "liked" : ""}`}
                onClick={async () => {
                  const userId = await getUserId();
                  const newCount = await like(post.id, userId, post.liked);

                  setPosts((prevPosts) =>
                    prevPosts.map((p) =>
                      p.id === post.id
                        ? { ...p, likes: newCount, liked: !p.liked }
                        : p,
                    ),
                  );
                }}
              >
                <Heart
                  size={16}
                  fill={post.liked ? "#ef4444" : "none"}
                  stroke={post.liked ? "#ef4444" : "currentColor"}
                />
                J'aime <span>{post.likes || 0}</span>
              </button>
              <button className="post-action-btn">
                <MessageCircle size={16} /> Commenter
              </button>
              <button className="post-action-btn">
                <Share2 size={16} /> Partager
              </button>
            </div>
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
