import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import "../styles/Posts.css";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { getUser } from "../services/systemeLike/getUser";
import { like } from "../services/systemeLike/like-a-post";
import { shareContent } from "../services/share";
import SuggestionsCarousel from "../components/SuggestionsCarousel";
import { fetchPostsWithLikes } from "../services/post/post";
import { notifierLike } from "../services/notifications/createurNotifications.js";

function PostImage({ src, alt, onClick }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "16 / 10",
        maxHeight: "420px",
        borderRadius: "14px",
        overflow: "hidden",
        backgroundColor: "#f1f5f9",
        margin: "12px 0",
      }}
    >
      <img
        src={src}
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "blur(18px)",
          transform: "scale(1.08)",
          opacity: loaded ? 0.55 : 0,
          transition: "opacity 0.25s ease",
        }}
      />
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
          setLoaded(true);
        }}
        onError={() => console.error("PostImage failed to load:", src)}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          objectFit: "contain",
          objectPosition: "center",
          cursor: "pointer",
          display: "block",
          zIndex: loaded ? 2 : 0,
          transition: "opacity 0.2s ease",
        }}
      />
    </div>
  );
}

export default function Posts({ refreshKey }) {
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { theme } = useTheme();

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getUser,
  });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: () => fetchPostsWithLikes(0, 10),
  });

  const getAvatarUrl = (profile) => {
    if (!profile)
      return `https://ui-avatars.com/api/?name=Unknown&background=random`;
    if (profile.avatar_url) return profile.avatar_url;
    return `https://ui-avatars.com/api/?name=${profile.name || "User"}&background=random`;
  };

  const loadMorePosts = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const newPosts = await fetchPostsWithLikes(nextPage * 10, 10);
    queryClient.setQueryData(["posts"], (old) => [...old, ...newPosts]);
    setPage(nextPage);
    setHasMore(newPosts.length === 10);
    setLoadingMore(false);
  };

  if (isLoading)
    return (
      <div className="posts-page" data-theme={theme}>
        <div className="posts-container">
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
        {message && <p className="message">{message}</p>}
        {posts.length === 0 && (
          <p className="empty-message">Aucun post pour le moment.</p>
        )}

        {posts.map((post, index) => (
          <div key={post.id}>
            <div className="post-card">
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
                    const newCount = await like(post.id, user.id, post.liked);
                    
                    if (!post.liked) {
                      await notifierLike(user.id, post.id);
                    }
                    
                    queryClient.setQueryData(["posts"], (oldPosts) =>
                      oldPosts.map((p) =>
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
                  J'aime
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
                  onClick={async () => {
                    const result = await shareContent({
                      title: post.title || "Post",
                      text: post.content,
                      url: `${window.location.origin}/home/post/${post.id}`,
                    });

                    if (result.ok && result.mode === "clipboard") {
                      setMessage("Lien copie dans le presse-papiers.");
                      setTimeout(() => setMessage(""), 2200);
                    }
                  }}
                >
                  <Share2 size={16} /> Partager
                </button>
              </div>
            </div>
            
            {index === 4 && <SuggestionsCarousel />}
          </div>
        ))}
        
        {hasMore && (
          <button
            onClick={loadMorePosts}
            disabled={loadingMore}
            className="load-more-btn"
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "20px",
              borderRadius: "8px",
              backgroundColor: theme === "dark" ? "#374151" : "#e5e7eb",
              color: theme === "dark" ? "#f3f4f6" : "#1f2937",
              border: "none",
              cursor: loadingMore ? "not-allowed" : "pointer",
              opacity: loadingMore ? 0.7 : 1,
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            {loadingMore ? "Chargement..." : "Charger plus de posts"}
          </button>
        )}
      </div>
    </div>
  );
}