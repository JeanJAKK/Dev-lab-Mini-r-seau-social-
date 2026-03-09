import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import supabase from "../services/supabase";
import "../styles/Posts.css";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { getUserId } from "../services/systemeLike/getUserId";
import { like } from "../services/systemeLike/Like";

function PostImage({ src, alt, onClick }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: "14px",
        overflow: "hidden",
        backgroundColor: "#f1f5f9",
        minHeight: "300px",
      }}
    >
      {!loaded && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "#e5e7eb",
            zIndex: 1,
          }}
        />
      )}
      <img
        src={src}
        alt={alt}
        onClick={onClick}
        onLoad={() => {
          console.log("PostImage loaded:", src);
          setLoaded(true);
        }}
        onError={() => console.error("PostImage failed to load:", src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          cursor: "pointer",
          display: "block",
          zIndex: loaded ? 2 : 0,
          transition: "opacity 0.2s ease",
        }}
      />
    </div>
  );
}

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const { theme } = useTheme();

  const getAvatarUrl = (profile) => {
    if (!profile)
      return `https://ui-avatars.com/api/?name=Unknown&background=random`;
    if (profile.avatar_url) return profile.avatar_url;
    return `https://ui-avatars.com/api/?name=${profile.name || "User"}&background=random`;
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

        const { data: commentData, error: commentError } = await supabase
          .from("comments")
          .select("*");
        if (commentError) throw commentError;

        const userId = await getUserId();

        // 3️⃣ Ajouter likes et liked à chaque post
        const postsWithLikes = postsData.map((post) => {
          const comments = commentData.filter((com) => com.post_id === post.id);
          const postLikes = likesData.filter(
            (like) => like.post_id === post.id,
          );
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

  if (loading)
    return (
      <div className="posts-page" data-theme={theme}>
        <div className="posts-container">
          <h2 className="posts-title">Fil d'actualité</h2>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="post-card">
              <div className="flex w-full flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="skeleton h-16 w-16 shrink-0 rounded-full"></div>
                  <div className="flex flex-col gap-4">
                    <div className="skeleton h-4 w-20"></div>
                    <div className="skeleton h-4 w-28"></div>
                  </div>
                </div>
                <div className="skeleton h-32 w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

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
              <Link
                to={`/home/profile/${post.user_id}`}
                className="user-avatar"
              >
                <img
                  src={getAvatarUrl(post.profiles)}
                  alt={post.profiles?.name || "profile"}
                  className="w-10 h-10 rounded-full border-2 object-cover"
                  style={{
                    borderColor: theme === "dark" ? "#6b7280" : "#d1d5db",
                  }}
                />
              </Link>
              <div className="post-meta">
                <Link to={`/home/profile/${post.user_id}`}>
                  <h3 className="post-username" style={{ cursor: "pointer" }}>
                    {post.profiles?.name}
                  </h3>
                </Link>
                <span className="post-date">
                  {new Date(post.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            {post.image_url && (
              <PostImage
                src={post.image_url}
                alt={post.title}
                onClick={() => navigate(`/home/post/${post.id}`)}
              />
            )}

            <p className="post-content">{post.content}</p>

            {post.likes > 0 && (
              <div className="post-likes">
                ❤️ <span>{post.likes}</span>
              </div>
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
                className="post-action-btn"
                onClick={() => navigate(`/home/post/${post.id}`)}
              >
                <MessageCircle size={16} /> Commenter
                {post.comments?.length > 0 && (
                  <span>{post.comments.length}</span>
                )}
              </button>
              <button 
                className="post-action-btn"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: post.title || 'Post',
                      text: post.content,
                      url: window.location.origin + `/home/post/${post.id}`
                    }).catch(err => console.log('Erreur de partage:', err));
                  } else {
                    // Fallback: copier le lien dans le presse-papiers
                    navigator.clipboard.writeText(window.location.origin + `/home/post/${post.id}`).then(() => {
                      alert('Lien copié dans le presse-papiers !');
                    }).catch(err => console.error('Erreur lors de la copie:', err));
                  }
                }}
              >
                <Share2 size={16} /> Partager
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
