import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Calendar, X, Camera, ArrowLeft, UserPlus, UserCheck } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import supabase from "../services/supabase.js";
import { getUser } from "../services/systemeLike/getUser.js";
import { notifierAbonnement } from "../services/notifications/createurNotifications.js";

function PostImage({ src, alt, onClick }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
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
          console.log("Image loaded:", src);
          setLoaded(true);
        }}
        onError={() => console.error("Image failed to load", src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          cursor: "pointer",
          display: "block",
          zIndex: loaded ? 2 : 0,
        }}
      />
    </div>
  );
}

export default function Profile() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();

  const [profileImage, setProfileImage] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  const [profile, setProfile] = useState({
    id: null,
    name: "Chargement...",
    username: "",
    bio: "",
    avatar: null,
    cover: "",
    postsCount: 0,
    followers: 0,
    following: 0,
    joinedAt: "",
  });

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const user = await getUser();

        if (!user) {
          setMessage("Vous devez être connecté pour voir votre profil.");
          return;
        }

        setCurrentUser(user);

        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Erreur profil:", error);
          setMessage("Erreur lors du chargement du profil.");
          return;
        }

        if (profileData) {
          setProfile({
            id: profileData.id,
            name: profileData.name || user.email?.split("@")[0] || "Utilisateur",
            username: profileData.username || "",
            bio: profileData.bio || "",
            avatar: profileData.avatar_url,
            cover: profileData.cover_url || null,
            postsCount: profileData.posts_count || 0,
            followers: profileData.followers_count || 0,
            following: profileData.following_count || 0,
            joinedAt: profileData.created_at
              ? new Date(profileData.created_at).toLocaleDateString("fr-FR", {
                  month: "long",
                  year: "numeric",
                })
              : "Date inconnue",
          });
        } else {
          const defaultProfile = {
            id: user.id,
            name: user.email?.split("@")[0] || "Utilisateur",
            username: "",
            bio: "",
            avatar: null,
            cover: null,
            postsCount: 0,
            followers: 0,
            following: 0,
            joinedAt: new Date().toLocaleDateString("fr-FR", {
              month: "long",
              year: "numeric",
            }),
          };
          setProfile(defaultProfile);
        }

        await loadUserPosts(user.id);
        await loadFollowersList(user.id);
        await loadFollowingList(user.id);
      } catch (err) {
        console.error("Erreur:", err);
        setMessage("Erreur lors du chargement du profil.");
      }
    };

    loadUserProfile();
  }, []);

  const loadFollowersList = async (userId) => {
    try {
      const { data: idsData, error: idsError } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("following_id", userId);
      if (idsError) throw idsError;
      const ids = idsData.map((r) => r.follower_id);
      if (ids.length === 0) {
        setFollowersList([]);
        return;
      }
      const { data: profiles, error: profError } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .in("id", ids);
      if (profError) throw profError;
      setFollowersList(profiles || []);
    } catch (err) {
      console.error("Erreur chargement followers", err);
    }
  };

  const loadFollowingList = async (userId) => {
    try {
      const { data: idsData, error: idsError } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", userId);
      if (idsError) throw idsError;
      const ids = idsData.map((r) => r.following_id);
      if (ids.length === 0) {
        setFollowingList([]);
        return;
      }
      const { data: profiles, error: profError } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")
        .in("id", ids);
      if (profError) throw profError;
      setFollowingList(profiles || []);
    } catch (err) {
      console.error("Erreur chargement following", err);
    }
  };

  const loadUserPosts = async (userId) => {
    setPostsLoading(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur chargement posts:", error);
        setMessage("Erreur lors du chargement des publications: " + error.message);
        return;
      }

      setUserPosts(data || []);
      setProfile((prev) => ({ ...prev, postsCount: data?.length || 0 }));
    } catch (err) {
      console.error("Erreur générale loadUserPosts:", err);
      setMessage("Erreur inattendue lors du chargement des posts.");
    } finally {
      setPostsLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser || !profile.id) return;
    
    if (isFollowing) {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", currentUser.id)
        .eq("following_id", profile.id);
      
      if (!error) {
        setIsFollowing(false);
        setProfile(prev => ({ ...prev, followers: prev.followers - 1 }));
      }
    } else {
      const { error } = await supabase
        .from("follows")
        .insert({ follower_id: currentUser.id, following_id: profile.id });
      
      if (!error) {
        await notifierAbonnement(currentUser.id, profile.id);
        setIsFollowing(true);
        setProfile(prev => ({ ...prev, followers: prev.followers + 1 }));
      }
    }
  };

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!currentUser || !profile.id) return;
      
      const { data } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", currentUser.id)
        .eq("following_id", profile.id)
        .maybeSingle();
      
      setIsFollowing(!!data);
    };
    
    checkFollowStatus();
  }, [currentUser, profile.id]);

  const [activeTab, setActiveTab] = useState("posts");
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [isEditingCover, setIsEditingCover] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  const sanitizeFileName = (name) => {
    return name.replace(/[^a-zA-Z0-9._-]/g, "_");
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setMessage("");

    try {
      if (!currentUser) {
        setMessage("Vous devez être connecté pour modifier votre photo de profil.");
        setLoading(false);
        return;
      }

      const fileName = sanitizeFileName(`${currentUser.id}_${Date.now()}_${file.name}`);
      const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, file);

      if (uploadError) {
        setMessage("Erreur upload : " + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName);
      const avatarUrl = urlData.publicUrl;

      const { error: updateError } = await supabase.from("profiles").upsert({
        id: currentUser.id,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      });

      if (updateError) {
        setMessage("Erreur mise à jour : " + updateError.message);
        setLoading(false);
        return;
      }

      setProfile((prev) => ({ ...prev, avatar: avatarUrl }));
      setProfileImage(avatarUrl);
      setMessage("Photo de profil mise à jour avec succès !");
    } catch (err) {
      console.error("Erreur:", err);
      setMessage("Erreur inattendue lors de l'upload.");
    } finally {
      setLoading(false);
    }
  };

  const handleCoverUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setMessage("");

    try {
      if (!currentUser) {
        setMessage("Vous devez être connecté pour modifier votre photo de couverture.");
        setLoading(false);
        return;
      }

      const fileName = sanitizeFileName(`${currentUser.id}_cover_${Date.now()}_${file.name}`);
      const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, file);

      if (uploadError) {
        setMessage("Erreur upload couverture : " + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName);
      const coverUrl = urlData.publicUrl;

      const { error: updateError } = await supabase.from("profiles").upsert({
        id: currentUser.id,
        cover_url: coverUrl,
        updated_at: new Date().toISOString(),
      });

      if (updateError) {
        setMessage("Erreur mise à jour couverture : " + updateError.message);
        setLoading(false);
        return;
      }

      setProfile((prev) => ({ ...prev, cover: coverUrl }));
      setMessage("Photo de couverture mise à jour avec succès !");
      setIsEditingCover(false);
    } catch (err) {
      console.error("Erreur upload couverture:", err);
      setMessage("Erreur inattendue lors de l'upload de la couverture.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = async () => {
    setLoading(true);
    setMessage("");

    try {
      if (!currentUser) {
        setMessage("Vous devez être connecté pour modifier votre photo de profil.");
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase.from("profiles").upsert({
        id: currentUser.id,
        avatar_url: null,
        updated_at: new Date().toISOString(),
      });

      if (updateError) {
        setMessage("Erreur suppression : " + updateError.message);
        setLoading(false);
        return;
      }

      setProfile((prev) => ({ ...prev, avatar: null }));
      setProfileImage(null);
      setMessage("Photo de profil supprimée avec succès !");
    } catch (err) {
      console.error("Erreur:", err);
      setMessage("Erreur inattendue lors de la suppression.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setProfile((prev) => ({
      ...prev,
      followers: followersList.length,
      following: followingList.length,
    }));
  }, [followersList.length, followingList.length]);

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className={`min-h-screen pb-24 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className={`w-full max-w-2xl mx-auto ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
        {message && (
          <div className="bg-blue-500/10 border-b border-blue-500/20 text-blue-600 px-4 py-2 text-center text-sm font-medium">
            {message}
          </div>
        )}

        <div className="relative h-32 sm:h-48 md:h-56 w-full overflow-hidden">
          <button onClick={() => navigate(-1)} className="absolute top-4 left-4 z-40 p-2 sm:p-2.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition shadow-md backdrop-blur-md cursor-pointer border-none">
            <ArrowLeft size={20} />
          </button>

          <div
            className="absolute inset-0 bg-cover bg-center cursor-pointer transition-transform hover:scale-[1.02]"
            onClick={() => profile.cover ? setFullscreenImage(profile.cover) : null}
            style={{
              backgroundImage: profile.cover
                ? `url(${profile.cover})`
                : "linear-gradient(135deg, #6d28d9 0%, #7c3aed 50%, #4f46e5 100%)",
            }}
          />

          <button onClick={() => setIsEditingCover(!isEditingCover)} className="absolute top-4 right-4 bg-black/40 text-white p-2 sm:p-2.5 rounded-full hover:bg-black/60 transition shadow-md backdrop-blur-sm border-none cursor-pointer">
            <Camera size={20} />
          </button>
        </div>

        {isEditingCover && (
          <div className={`p-4 border-b ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-200"}`}>
            <div className="max-w-5xl mx-auto">
              <h4 className={`text-sm font-semibold mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>Modifier la photo de couverture</h4>
              <div className="flex items-center gap-4">
                <input type="file" accept="image/*" onChange={handleCoverUpload} disabled={loading} className={`block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${isDark ? "file:bg-gray-600 file:text-gray-200 hover:file:bg-gray-500" : "file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"} disabled:opacity-50`} />
                <button onClick={() => setIsEditingCover(false)} className={`px-4 py-2 rounded-lg transition ${isDark ? "bg-gray-600 text-white hover:bg-gray-500" : "bg-gray-500 text-white hover:bg-gray-600"}`}>Annuler</button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-2xl mx-auto px-4 sm:px-6 relative">
          <div className="flex items-end justify-between -mt-12 sm:-mt-16 mb-4">
            <div className="relative shrink-0 z-10">
              {profile.avatar || profileImage ? (
                <img src={profile.avatar || profileImage} alt="avatar" onClick={() => setFullscreenImage(profile.avatar || profileImage)} className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover cursor-pointer shadow-md" />
              ) : (
                <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full shadow-md flex items-center justify-center ${isDark ? "bg-gray-800 text-gray-300" : "bg-gray-200 text-gray-600"}`}>
                  <span className="text-4xl sm:text-5xl font-bold">{profile.name.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              {isOwnProfile ? (
                <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition shadow-md mb-2 sm:mb-4">
                  <Camera size={16} />
                  <span className="hidden sm:inline">Modifier</span>
                </button>
              ) : (
                <button onClick={handleFollow} className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition shadow-md mb-2 sm:mb-4 ${isFollowing ? "bg-gray-500 hover:bg-gray-600 text-white" : "bg-purple-600 hover:bg-purple-700 text-white"}`}>
                  {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
                  <span>{isFollowing ? "Abonné" : "Suivre"}</span>
                </button>
              )}
            </div>
          </div>

          <div className="mb-5">
            <h1 className={`text-xl sm:text-2xl font-bold leading-tight ${isDark ? "text-white" : "text-gray-900"}`}>{profile.name}</h1>
            {profile.username && <p className="text-purple-400 text-sm font-medium mt-0.5">@{profile.username}</p>}
            {profile.bio && <p className={`mt-3 text-sm leading-relaxed max-w-md ${isDark ? "text-gray-300" : "text-gray-600"}`}>{profile.bio}</p>}
            <div className={`flex items-center gap-1.5 mt-2.5 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              <Calendar size={12} className="text-purple-400" />
              <span>Membre depuis {profile.joinedAt}</span>
            </div>
          </div>

          <div className={`flex gap-0 rounded-2xl overflow-hidden mb-6 border ${isDark ? "border-gray-700/60 bg-gray-800/50" : "border-gray-200 bg-white"}`}>
            <div className="flex-1 flex flex-col items-center py-3 gap-0.5">
              <span className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{profile.postsCount}</span>
              <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Publications</span>
            </div>
            <div className={`w-px ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
            
            <div className="flex-1 flex flex-col items-center py-3 gap-0.5 cursor-pointer hover:opacity-80" onClick={() => { setShowFollowers(!showFollowers); setShowFollowing(false); }}>
              <span className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{profile.followers}</span>
              <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Abonnés</span>
            </div>
            <div className={`w-px ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
            
            <div className="flex-1 flex flex-col items-center py-3 gap-0.5 cursor-pointer hover:opacity-80" onClick={() => { setShowFollowing(!showFollowing); setShowFollowers(false); }}>
              <span className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{profile.following}</span>
              <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Abonnements</span>
            </div>
          </div>

          {showFollowers && (
            <div className={`mt-4 max-h-48 overflow-y-auto border p-3 rounded-lg ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
              {followersList.length === 0 ? <p className={isDark ? "text-gray-400" : "text-gray-500"}>Aucun abonné</p> : followersList.map((u) => (
                <div key={u.id} className="flex items-center gap-3 mb-2">
                  {u.avatar_url ? <img src={u.avatar_url} alt={u.name} className="w-8 h-8 rounded-full object-cover" /> : <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? "bg-gray-600" : "bg-gray-300"}`}><span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>{u.name?.charAt(0).toUpperCase()}</span></div>}
                  <span className={`text-sm ${isDark ? "text-gray-200" : "text-gray-700"}`}>{u.name}</span>
                </div>
              ))}
            </div>
          )}
          
          {showFollowing && (
            <div className={`mt-4 max-h-48 overflow-y-auto border p-3 rounded-lg ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
              {followingList.length === 0 ? <p className={isDark ? "text-gray-400" : "text-gray-500"}>Pas d'abonnement</p> : followingList.map((u) => (
                <div key={u.id} className="flex items-center gap-3 mb-2">
                  {u.avatar_url ? <img src={u.avatar_url} alt={u.name} className="w-8 h-8 rounded-full object-cover" /> : <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? "bg-gray-600" : "bg-gray-300"}`}><span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>{u.name?.charAt(0).toUpperCase()}</span></div>}
                  <span className={`text-sm ${isDark ? "text-gray-200" : "text-gray-700"}`}>{u.name}</span>
                </div>
              ))}
            </div>
          )}

          {isEditingProfile && (
            <div className={`mt-6 p-6 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-gray-200" : "text-gray-700"}`}>Gérer la photo de profil</h3>
              <div className="space-y-4">
                <div>
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={loading} className={`block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${isDark ? "file:bg-gray-600 file:text-gray-200 hover:file:bg-gray-500" : "file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"} disabled:opacity-50`} />
                </div>
                {(profile.avatar || profileImage) && (
                  <div className="flex items-center gap-4">
                    <img src={profile.avatar || profileImage} alt="Aperçu" className={`w-20 h-20 rounded-full object-cover border-2 ${isDark ? "border-gray-600" : "border-gray-300"}`} />
                    <button onClick={handleRemoveImage} disabled={loading} className="px-4 py-2 rounded-lg transition disabled:opacity-50" style={{ backgroundColor: isDark ? "#dc2626" : "#ef4444", color: "white" }}>{loading ? "Suppression..." : "Supprimer la photo"}</button>
                  </div>
                )}
                {!profile.avatar && !profileImage && <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Vous n'avez pas encore de photo de profil.</p>}
              </div>
            </div>
          )}

          <div className="mt-8 sm:mt-12 mb-6 px-2 sm:px-6">
            <div className={`text-black font-bold rounded-full p-1 flex ${isDark ? "bg-gray-700 text-gray-200" : "bg-gray-200 text-black"}`}>
              <button onClick={() => setActiveTab("posts")} className={`flex-1 py-2 rounded-full text-sm font-medium transition ${activeTab === "posts" ? isDark ? "bg-gray-800 text-gray-100" : "bg-white text-black" : isDark ? "hover:bg-gray-600" : "hover:bg-gray-400"}`}>Publications</button>
              <button onClick={() => setActiveTab("likes")} className={`flex-1 py-2 rounded-full text-sm font-medium transition ${activeTab === "likes" ? isDark ? "bg-gray-800 text-gray-100" : "bg-white text-black" : isDark ? "hover:bg-gray-600" : "hover:bg-gray-400"}`}>Likes</button>
            </div>
          </div>

          <div className="mt-6 pb-24">
            {activeTab === "posts" && (
              <div>
                {postsLoading ? <div className="text-center py-10"><p className="text-gray-500">Chargement des publications...</p></div> : userPosts.length === 0 ? <div className="text-center py-10"><p className="text-gray-500">Aucune publication pour le moment.</p></div> : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {userPosts.map((post) => (
                      <div key={post.id} className="aspect-square group relative overflow-hidden rounded-lg bg-gray-200">
                        {post.image_url ? (
                          <>
                            <div className="relative w-full h-full">
                              <PostImage src={post.image_url} alt={post.title || "Post"} onClick={() => console.log("Image cliquée:", post.image_url)} />
                            </div>
                            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-all duration-200 flex items-center justify-center z-10">
                              <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center pointer-events-none">
                                <p className="text-sm font-semibold">{post.title}</p>
                                <p className="text-xs">{new Date(post.created_at).toLocaleDateString("fr-FR")}</p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                            <p className="text-gray-500 text-sm">Pas d'image</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "likes" && (
              <div className="text-center text-gray-500 py-10">Aucun contenu aimé.</div>
            )}
          </div>
        </div>
      </div>

      {fullscreenImage && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 p-4" onClick={() => setFullscreenImage(null)}>
          <button className="absolute top-6 right-6 text-white hover:bg-black/50 rounded-full p-2" onClick={() => setFullscreenImage(null)}><X size={32} /></button>
          <img src={fullscreenImage} alt="Plein écran" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}