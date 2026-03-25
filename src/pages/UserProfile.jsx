import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Grid3x3, ImageOff, MessageCircle } from "lucide-react";
import supabase from "../services/supabase";
import { useTheme } from "../context/ThemeContext";

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const avatarUrl = profile?.avatar_url || null;
  const userInitial = (profile?.name || "U").charAt(0).toUpperCase();

  useEffect(() => {
    const load = async () => {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      setProfile(profileData || null);

      const { data: postsData } = await supabase
        .from("posts")
        .select("id, title, image_url, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      setPosts(postsData || []);
      setLoading(false);
    };
    load();
  }, [userId]);

  if (loading) {
    return (
      <div className={`min-h-[60vh] flex items-center justify-center ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`min-h-[60vh] flex flex-col items-center justify-center gap-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
        <p className="text-base font-medium">Utilisateur introuvable.</p>
        <button onClick={() => navigate(-1)} className="text-sm text-purple-600 hover:underline bg-transparent border-none cursor-pointer p-0">
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-24 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>

      {/* ── Header sticky ── */}
      <div className={`flex items-center gap-3 px-4 h-14 border-b sticky top-[76px] z-40 backdrop-blur-md ${isDark ? "bg-gray-900/90 border-gray-700/60" : "bg-white/90 border-gray-200"}`}>
        <button
          onClick={() => navigate(-1)}
          className={`p-2 -ml-2 rounded-full border-none bg-transparent cursor-pointer transition ${isDark ? "hover:bg-gray-800 text-white" : "hover:bg-gray-100 text-gray-800"}`}
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className={`font-bold text-base truncate ${isDark ? "text-white" : "text-gray-900"}`}>
            {profile.name || "Profil"}
          </span>
          {posts.length > 0 && (
            <span className={`text-xs font-medium shrink-0 px-2 py-0.5 rounded-full ${isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-500"}`}>
              {posts.length}
            </span>
          )}
        </div>
      </div>

      {/* ── Cover simple ── */}
      <div className="relative h-32 sm:h-48 md:h-56 w-full overflow-hidden">
        {profile.cover_url ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${profile.cover_url})` }}
          />
        ) : (
          <div className={`absolute inset-0 ${isDark ? "bg-gray-800" : "bg-gray-300"}`}>
            <div className={`absolute inset-0 flex items-center justify-center gap-2 text-sm font-medium ${isDark ? "text-gray-600" : "text-gray-500"}`}>
              <ImageOff size={18} />
              <span>Aucune couverture</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Contenu principal ── */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 relative">

        {/* Avatar + bouton message */}
        <div className="flex items-end justify-between -mt-12 sm:-mt-16 mb-4">

          {/* Avatar minimaliste */}
          <div className="relative shrink-0 z-10">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={profile.name}
                className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 ${isDark ? "border-gray-900 bg-gray-900" : "border-gray-50 bg-white"}`}
              />
            ) : (
              <div
                className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 flex items-center justify-center ${isDark ? "border-gray-900 bg-gray-800" : "border-gray-50 bg-gray-200"}`}
              >
                <span className={`font-bold text-3xl sm:text-4xl ${isDark ? "text-gray-500" : "text-gray-400"}`}>{userInitial}</span>
              </div>
            )}
          </div>

          {/* Bouton message neutre */}
          <button
            onClick={() => navigate("/home/messages")}
            className={`flex items-center gap-2 px-5 py-2 rounded-full border transition font-medium text-sm mb-2 sm:mb-4 ${
              isDark 
                ? "bg-gray-100 hover:bg-gray-200 text-gray-900 border-transparent" 
                : "bg-gray-900 hover:bg-gray-800 text-white border-transparent"
            }`}
          >
            <MessageCircle size={16} />
            <span className="hidden sm:inline">Message</span>
          </button>
        </div>

        {/* Nom + username + bio + date */}
        <div className="mb-5">
          <h1 className={`text-xl sm:text-2xl font-bold leading-tight ${isDark ? "text-white" : "text-gray-900"}`}>
            {profile.name}
          </h1>
          {profile.username && (
            <p className="text-purple-400 text-sm font-medium mt-0.5">@{profile.username}</p>
          )}
          {profile.bio && (
            <p className={`mt-3 text-sm leading-relaxed max-w-md ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              {profile.bio}
            </p>
          )}
          {profile.created_at && (
            <div className="flex items-center gap-1.5 mt-2.5 text-xs">
              <Calendar size={12} className="text-purple-400" />
              <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                Membre depuis {new Date(profile.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
              </span>
            </div>
          )}
        </div>

        {/* Barre de statistiques : publications / abonnés / abonnements */}
        <div className={`flex gap-0 rounded-2xl overflow-hidden mb-6 border ${isDark ? "border-gray-700/60 bg-gray-800/50" : "border-gray-200 bg-white"}`}>
          <div className="flex-1 flex flex-col items-center py-3 gap-0.5">
            <span className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{posts.length}</span>
            <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Publications</span>
          </div>
          <div className={`w-px ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
          <div className="flex-1 flex flex-col items-center py-3 gap-0.5">
            <span className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>—</span>
            <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Abonnés</span>
          </div>
          <div className={`w-px ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
          <div className="flex-1 flex flex-col items-center py-3 gap-0.5">
            <span className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>—</span>
            <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Abonnements</span>
          </div>
        </div>

        {/* ── Grille publications ── */}
        <div>
          <div className={`flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-widest ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            <Grid3x3 size={13} /> Publications
          </div>

          {posts.length === 0 ? (
            <div className={`flex flex-col items-center justify-center gap-3 py-20 rounded-2xl ${isDark ? "bg-gray-800/40" : "bg-white"} border ${isDark ? "border-gray-700/60" : "border-gray-200"}`}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
                <ImageOff size={24} className={isDark ? "text-gray-500" : "text-gray-400"} />
              </div>
              <p className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Aucune publication pour l'instant
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
              {posts.map((post) => (
                <Link key={post.id} to={`/home/post/${post.id}`} className="block group">
                  <div className={`aspect-square overflow-hidden relative rounded-xl ${isDark ? "bg-gray-800" : "bg-gray-200"} shadow-sm`}>
                    {post.image_url ? (
                      <>
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="w-full h-full object-cover transition duration-300 group-hover:scale-105 group-hover:brightness-90"
                        />
                        {/* Overlay hover avec titre */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-200 flex items-end p-2">
                          {post.title && (
                            <p className="text-white text-xs font-medium line-clamp-2 leading-tight">
                              {post.title}
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1.5">
                        <ImageOff size={20} className={isDark ? "text-gray-600" : "text-gray-400"} />
                        {post.title && (
                          <p className={`text-xs text-center px-2 line-clamp-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                            {post.title}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
