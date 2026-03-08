import { useEffect, useState } from "react";
import supabase from "../services/supabase";
import "../styles/Posts.css";
import { User, Heart, MessageCircle, Share2 } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { getUserId } from "../services/systemeLike/getUserId";
import { like } from "../services/systemeLike/Like";
import { sendComment } from "../services/gestionComments/SendComment";

function PostImage({ src, alt, onClick }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '14px', overflow: 'hidden', backgroundColor: '#f1f5f9', minHeight: '300px' }}>
      {!loaded && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#e5e7eb',
          zIndex: 1
        }} />
      )}
      <img
        src={src}
        alt={alt}
        onClick={onClick}
        onLoad={() => {
          console.log('PostImage loaded:', src);
          setLoaded(true);
        }}
        onError={() => console.error('PostImage failed to load:', src)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          cursor: 'pointer',
          display: 'block',
          zIndex: loaded ? 2 : 0,
          transition: 'opacity 0.2s ease'
        }}
      />
    </div>
  );
}

export default function Posts() {
  const [comment, setComment] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [modalImage, setModalImage] = useState(null);
  const [openComments, setOpenComments] = useState({});

  const { theme } = useTheme();

  const getAvatarUrl = (profile) => {
    if (!profile) return `https://ui-avatars.com/api/?name=Unknown&background=random`;
    if (profile.avatar_url) return profile.avatar_url;
    return `https://ui-avatars.com/api/?name=${profile.name || 'User'}&background=random`;
  };

  useEffect(() => {
    const fetchPostsWithLikes = async () => {
      setLoading(true);
      try {
        // 1️⃣ Récupérer tous les posts avec les infos du profil
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select("*, profiles!posts_user_id_fkey(name, avatar_url)")
          .order("created_at", { ascending: false });

        if (postsError) throw postsError;

        // 2️⃣ Récupérer tous les likes pour tous les posts
        const { data: likesData, error: likesError } = await supabase
          .from("likes")
          .select("*"); // on prend post_id et user_id

        if (likesError) throw likesError;

        const {data: commentData, error: commentError} = await supabase
          .from("comments")
          .select("*")
        if(commentError) throw commentError;

        const userId = await getUserId();

        // 3️⃣ Ajouter likes et liked à chaque post
        const postsWithLikes = postsData.map((post) => {
          const comments = commentData.filter((com) => com.post_id === post.id);
          const postLikes = likesData.filter((like) => like.post_id === post.id,);
          const likesCount = postLikes.length;
          const userLiked = postLikes.some((like) => like.user_id === userId);
          return {
            ...post,
            likes: likesCount,
            liked: userLiked,
            comments: comments,
          };
        });

        setPosts(postsWithLikes);
      } catch (err) {
        console.error(err);
        setMessage("❌ Erreur lors du chargement des posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPostsWithLikes();
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
                  src={getAvatarUrl(post.profiles)}
                  alt={post.profiles?.name || "profile"}
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

            {post.likes > 0 && (
              <div className="post-likes">❤️ <span>{post.likes}</span></div>
            )}

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
                J'aime <span>{post.likes}</span>
              </button>
              <button
                className={`post-action-btn ${openComments[post.id] ? "active" : ""}`}
                onClick={() =>
                  setOpenComments((prev) => ({ ...prev, [post.id]: !prev[post.id] }))
                }
              >
                <MessageCircle size={16} /> Commenter
              </button>
              <button className="post-action-btn">
                <Share2 size={16} /> Partager
              </button>
            </div>

            {openComments[post.id] && (
              <div className="zone-commentaires">
                <div className="ecrire-commentaire">
                  <input
                    className="champ-commentaire"
                    type="text"
                    placeholder="Écrire un commentaire…"
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <button 
                  className="bouton-envoyer"
                  onClick={async()=>{
                    const userId = await getUserId();
                    sendComment(userId, post.id, comment)
                  }}
                  >Envoyer</button>
                </div>
              </div>
            )}
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
