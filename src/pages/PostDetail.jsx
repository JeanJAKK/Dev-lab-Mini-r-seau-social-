import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Heart, Send, MoreHorizontal, CornerDownRight, X, Share2, Download } from "lucide-react";
import supabase from "../services/supabase";
import { useTheme } from "../context/ThemeContext";
import { getUser } from "../services/systemeLike/getUser";
import { like } from "../services/systemeLike/Like";
import { sendComment } from "../services/gestionComments/SendComment";
import { shareContent } from "../services/share";

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shareNotice, setShareNotice] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState();
  const [currentProfile, setCurrentProfile] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null); // { id, nom } — commentaire ciblé par la réponse

  const getAvatarUrl = (profile) => {
    if (!profile) return `https://ui-avatars.com/api/?name=U&background=7c3aed&color=fff`;
    if (profile.avatar_url) return profile.avatar_url;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || "U")}&background=7c3aed&color=fff`;
  };

  // Tabulation comme séparateur — introuvable sur un clavier classique, impossible à injecter
  const buildReplyContent = (name, text) => `@${name}\t${text}`;
  const parseComment = (content) => {
    const tabIdx = content.indexOf("\t");
    if (tabIdx > 0 && content.startsWith("@")) {
      return { mention: content.slice(1, tabIdx), text: content.slice(tabIdx + 1) };
    }
    return { mention: null, text: content };
  };

  // Bloquer le scroll du body pendant l'affichage de la page détail
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from("comments")
      .select("*, profiles(name, avatar_url)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    setComments(data || []);
  }, [postId]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setUser(await getUser());
      if (user) {
        const { data: profile } = await supabase
          .from("profiles").select("name, avatar_url").eq("id", user.id).single();
        setCurrentProfile(profile);
      }
      const userId = user.id;
      const { data: postData, error } = await supabase
        .from("posts")
        .select("*, profiles!posts_user_id_fkey(id, name, avatar_url)")
        .eq("id", postId).single();
      if (!error && postData) {
        const { data: likesData } = await supabase.from("likes").select("*").eq("post_id", postId);
        const liked = likesData?.some((l) => l.user_id === userId) || false;
        setPost({ ...postData, likes: likesData?.length || 0, liked });
      }
      await fetchComments();
      setLoading(false);
    };
    init();
  }, [postId, fetchComments]);

  const handleLike = async () => {
    const userId = user.id;
    const newCount = await like(postId, userId, post.liked);
    setPost((p) => ({ ...p, likes: newCount, liked: !p.liked }));
  };

  const handleReply = (comment) => {
    setReplyingTo({ id: comment.id, name: comment.profiles?.name || "Utilisateur" });
    setCommentText("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setCommentText("");
  };

  const handleSubmit = async () => {
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    const userId = user.id;
    const content = replyingTo
      ? buildReplyContent(replyingTo.name, commentText.trim())
      : commentText.trim();
    await sendComment(userId, postId, content);
    setCommentText("");
    setReplyingTo(null);
    await fetchComments();
    setSubmitting(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleShare = async () => {
    const result = await shareContent({
      title: post.title || "Post",
      text: post.content,
      url: `${window.location.origin}/home/post/${post.id}`,
    });

    if (result.ok && result.mode === "clipboard") {
      setShareNotice("Lien copie dans le presse-papiers.");
      setTimeout(() => setShareNotice(""), 2200);
    }
  };

  const handleDownloadImage = () => {
    if (!post?.image_url) {
      setShareNotice("Aucune image a telecharger.");
      setTimeout(() => setShareNotice(""), 2200);
      return;
    }

    try {
      const link = document.createElement("a");
      link.href = post.image_url;
      link.download = `${(post.title || "post-image").replace(/[^a-zA-Z0-9_-]/g, "-")}.jpg`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setShareNotice("Telechargement lance.");
      setTimeout(() => setShareNotice(""), 2200);
    } catch {
      setShareNotice("Impossible de telecharger cette image.");
      setTimeout(() => setShareNotice(""), 2200);
    }
  };

  if (loading) {
    return (
      <div className={`fixed inset-0 z-50 flex flex-col overflow-hidden ${isDark ? "bg-gray-900" : "bg-white"}`}>
        {/* Header mobile skeleton */}
        <div className={`flex items-center gap-3 px-4 h-14 border-b shrink-0 ${isDark ? "border-gray-700" : "border-gray-200"}`}>
          <div className="skeleton w-8 h-8 rounded-full shrink-0"></div>
          <div className="skeleton h-4 w-28"></div>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Image skeleton */}
          <div className={`skeleton shrink-0 h-56 sm:h-72 md:h-auto md:flex-1`}></div>

          {/* Panneau droit skeleton */}
          <div className={`flex flex-col flex-1 md:flex-none md:w-[380px] overflow-hidden ${isDark ? "bg-gray-900 border-l border-gray-700" : "bg-white border-l border-gray-200"}`}>

            {/* Auteur skeleton */}
            <div className={`flex items-center gap-3 px-4 py-3 border-b shrink-0 ${isDark ? "border-gray-700" : "border-gray-100"}`}>
              <div className="skeleton w-10 h-10 rounded-full shrink-0"></div>
              <div className="flex flex-col gap-2 flex-1">
                <div className="skeleton h-3 w-24"></div>
                <div className="skeleton h-3 w-16"></div>
              </div>
            </div>

            {/* Contenu post skeleton */}
            <div className={`flex gap-3 px-4 py-3 border-b shrink-0 ${isDark ? "border-gray-700" : "border-gray-100"}`}>
              <div className="skeleton w-8 h-8 rounded-full shrink-0"></div>
              <div className="flex flex-col gap-2 flex-1 mt-1">
                <div className="skeleton h-3 w-full"></div>
                <div className="skeleton h-3 w-4/5"></div>
                <div className="skeleton h-3 w-2/3"></div>
              </div>
            </div>

            {/* Commentaires skeleton */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="skeleton w-8 h-8 rounded-full shrink-0 mt-1"></div>
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="skeleton h-3 w-20"></div>
                    <div className="skeleton h-3 w-full"></div>
                    <div className="skeleton h-3 w-3/4"></div>
                    <div className="skeleton h-2 w-12 mt-1"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className={`fixed inset-0 z-50 flex flex-col overflow-hidden ${isDark ? "bg-gray-900" : "bg-white"}`}>

      {/* ── Header mobile ── */}
      <div className={`md:hidden flex items-center gap-3 px-4 h-14 border-b shrink-0 ${isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>
        <button
          onClick={() => navigate(-1)}
          className={`p-2 -ml-2 rounded-full border-none bg-transparent cursor-pointer transition ${isDark ? "text-white hover:bg-gray-800" : "text-gray-800 hover:bg-gray-100"}`}
        >
          <ArrowLeft size={20} />
        </button>
        <span className={`font-bold text-base ${isDark ? "text-white" : "text-gray-900"}`}>Publication</span>
      </div>

      {/* ── Layout : flex-col mobile | flex-row desktop ── */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

        {/* IMAGE */}
        {post.image_url && (
          <div className={`relative flex items-center justify-center shrink-0 h-56 sm:h-72 md:h-auto md:flex-1 overflow-hidden ${isDark ? "bg-black" : "bg-gray-950"}`}>
            {/* Bouton retour desktop */}
            <button
              onClick={() => navigate(-1)}
              className="hidden md:flex absolute top-4 left-4 z-10 items-center justify-center w-10 h-10 rounded-full border-none bg-black/40 hover:bg-black/60 cursor-pointer transition"
            >
              <ArrowLeft size={18} className="text-white" />
            </button>
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-full object-cover md:object-contain"
            />
          </div>
        )}

        {/* ── PANNEAU DROIT ── */}
        <div className={`flex flex-col flex-1 md:flex-none overflow-hidden ${post.image_url ? "md:w-[380px]" : ""} ${isDark ? "bg-gray-900 border-l border-gray-700" : "bg-white border-l border-gray-200"}`}>

          {/* Bouton retour desktop (quand pas d'image) */}
          {!post.image_url && (
            <div className={`hidden md:flex items-center gap-3 px-4 h-14 border-b justify-between shrink-0 ${isDark ? "border-gray-700" : "border-gray-200"}`}>
              <button
                onClick={() => navigate(-1)}
                className={`p-2 -ml-2 rounded-full border-none bg-transparent cursor-pointer transition ${isDark ? "text-white hover:bg-gray-800" : "text-gray-800 hover:bg-gray-100"}`}
              >
                <ArrowLeft size={20} />
              </button>
              <span className={`font-bold text-base ${isDark ? "text-white" : "text-gray-900"}`}>Publication</span>
            </div>
          )}

          {/* Auteur */}
          <div className={`flex items-center gap-3 px-4 py-3 border-b shrink-0 ${isDark ? "border-gray-700" : "border-gray-100"}`}>
            <Link to={`/home/profile/${post.user_id}`} className="shrink-0">
              <img
                src={getAvatarUrl(post.profiles)}
                alt={post.profiles?.name}
                className="w-10 h-10 rounded-full object-cover hover:opacity-80 transition"
              />
            </Link>
            <div className="flex-1 min-w-0">
              <Link to={`/home/profile/${post.user_id}`}>
                <p className={`font-semibold text-sm hover:underline ${isDark ? "text-white" : "text-gray-900"}`}>
                  {post.profiles?.name}
                </p>
              </Link>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(post.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className={`p-1.5 rounded-full border-none bg-transparent cursor-pointer transition ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              >
                <MoreHorizontal size={18} className={isDark ? "text-gray-400" : "text-gray-500"} />
              </button>

              {isMenuOpen && (
                <div
                  className={`absolute right-0 top-10 z-20 min-w-[190px] rounded-xl border shadow-lg py-1 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
                >
                  {post.image_url && (
                    <button
                      onClick={() => {
                        handleDownloadImage();
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm border-none bg-transparent cursor-pointer transition ${isDark ? "text-gray-200 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}`}
                    >
                      <Download size={16} />
                      Telecharger
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Description du post */}
          {post.content && (
            <div className={`flex gap-3 px-4 py-3 border-b shrink-0 ${isDark ? "border-gray-700" : "border-gray-100"}`}>
              <img src={getAvatarUrl(post.profiles)} alt="" className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5" />
              <p className={`text-sm leading-relaxed ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                <span className={`font-semibold mr-1.5 ${isDark ? "text-white" : "text-gray-900"}`}>{post.profiles?.name}</span>
                {post.content}
              </p>
            </div>
          )}

          {/* Liste des commentaires — défilable */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {comments.length === 0 ? (
              <p className={`text-center text-sm py-10 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                Aucun commentaire. Sois le premier !
              </p>
            ) : (
              <div className="space-y-5">
                {comments.map((c) => {
                  const { mention, text } = parseComment(c.content);
                  return (
                    <div key={c.id} className="flex gap-3 items-start">
                      <Link to={`/home/profile/${c.user_id}`} className="shrink-0 mt-1">
                        <img
                          src={getAvatarUrl(c.profiles)}
                          alt={c.profiles?.name}
                          className="w-8 h-8 rounded-full object-cover hover:opacity-80 transition"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        {mention && (
                          <div className="flex items-center gap-1 mb-1">
                            <CornerDownRight size={11} className="text-purple-400 shrink-0" />
                            <span className="text-xs font-medium text-purple-400">@{mention}</span>
                          </div>
                        )}
                        <p className={`text-sm leading-relaxed ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                          <span className={`font-semibold mr-1.5 ${isDark ? "text-white" : "text-gray-900"}`}>
                            {c.profiles?.name || "Utilisateur"}
                          </span>
                          {text}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-400">
                            {new Date(c.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                          </span>
                          <button
                            onClick={() => handleReply(c)}
                            className="text-xs font-semibold text-gray-400 hover:text-purple-500 bg-transparent border-none p-0 cursor-pointer transition"
                          >
                            Répondre
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Actions — boutons j'aime et partager */}
          <div className={`px-4 py-3 border-t shrink-0 ${isDark ? "border-gray-700" : "border-gray-200"}`}>
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className="flex items-center gap-2 bg-transparent border-none cursor-pointer p-0"
              >
                <Heart
                  size={22}
                  fill={post.liked ? "#ef4444" : "none"}
                  stroke={post.liked ? "#ef4444" : isDark ? "#9ca3af" : "#6b7280"}
                  className="transition-transform duration-100"
                />
                <span className={`text-sm font-semibold ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                  {post.likes} {post.likes <= 1 ? "j'aime" : "j'aimes"}
                </span>
              </button>
              <button
                onClick={handleShare}
                className={`flex items-center gap-2 bg-transparent border-none cursor-pointer p-0 ${isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-800"}`}
              >
                <Share2 size={20} />
                <span className="text-sm font-semibold">Partager</span>
              </button>
            </div>
            {shareNotice && (
              <p className={`mt-2 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                {shareNotice}
              </p>
            )}
          </div>

          {/* Bandeau de réponse à un commentaire */}
          {replyingTo && (
            <div className={`flex items-center justify-between px-4 py-2 border-t shrink-0 ${isDark ? "bg-gray-800 border-gray-700" : "bg-purple-50 border-purple-100"}`}>
              <div className="flex items-center gap-2">
                <CornerDownRight size={14} className="text-purple-500 shrink-0" />
                <span className={`text-xs ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  Répondre à{" "}
                  <span className="font-semibold text-purple-500">@{replyingTo.name}</span>
                </span>
              </div>
              <button
                onClick={cancelReply}
                className="p-1 rounded-full bg-transparent border-none cursor-pointer hover:bg-gray-500/20 transition"
              >
                <X size={14} className={isDark ? "text-gray-400" : "text-gray-500"} />
              </button>
            </div>
          )}

          {/* Zone de saisie du commentaire */}
          <div className={`flex items-center gap-3 px-4 py-3 border-t shrink-0 ${isDark ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-white"}`}>
            <img
              src={getAvatarUrl(currentProfile)}
              alt="moi"
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />
            <input
              ref={inputRef}
              type="text"
              placeholder={replyingTo ? `Répondre à @${replyingTo.name}…` : "Ajouter un commentaire…"}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
              className={`flex-1 bg-transparent text-sm outline-none border-none shadow-none ring-0 placeholder-gray-400 ${isDark ? "text-gray-100" : "text-gray-800"}`}
            />
            {commentText.trim() && (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="shrink-0 p-2 rounded-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition active:scale-90 border-none cursor-pointer"
              >
                <Send size={13} className="text-white" />
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
