// ===============================
// Profile.jsx
// ===============================

import { useState, useEffect } from "react";
import { Calendar, Settings } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import supabase from "../services/supabase.js";
import { getUser } from "../services/systemeLike/getUser.js";

// Composant PostImage ultra-simple comme dans Posts.jsx
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

  //  ÉTAT POUR LA GESTION DE LA PHOTO DE PROFIL
  const [profileImage, setProfileImage] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // DONNÉES UTILISATEUR (RÉCUPÉRÉES DE SUPABASE)
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

  // Charger les données utilisateur au montage
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const user = await getUser();

        if (!user) {
          setMessage("Vous devez être connecté pour voir votre profil.");
          return;
        }

        setCurrentUser(user);

        // Récupérer les données du profil depuis la table profiles
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
            name:
              profileData.name || user.email?.split("@")[0] || "Utilisateur",
            username: profileData.username || "",
            bio: profileData.bio || "",
            avatar: profileData.avatar_url,
            cover:
              profileData.cover_url || null,
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
          // Créer un profil par défaut si inexistant
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

        // Charger les posts de l'utilisateur
        await loadUserPosts(user.id);
        // charger listes follow
        await loadFollowersList(user.id);
        await loadFollowingList(user.id);
        // counts will be synced by effect below
      } catch (err) {
        console.error("Erreur:", err);
        setMessage("Erreur lors du chargement du profil.");
      }
    };

    loadUserProfile();
  }, []);

  // helpers for followers/following
  const loadFollowersList = async (userId) => {
    try {
      // first grab follower IDs
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
      // then fetch profiles
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

  // Charger les posts de l'utilisateur
  const loadUserPosts = async (userId) => {
    setPostsLoading(true);
    try {
      console.log(" Chargement des posts de l'utilisateur...", userId);

      // Vérifier d'abord si l'utilisateur existe
      const { data: userCheck, error: userError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .single();

      if (userError) {
        console.error(" Erreur vérification utilisateur:", userError);
      } else {
        console.log(" Utilisateur vérifié:", userCheck);
      }

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(" Erreur chargement posts:", error);
        console.error(" Détails erreur:", {
          code: error.code,
          message: error.message,
          details: error.details,
        });
        setMessage(
          "Erreur lors du chargement des publications: " + error.message,
        );
        return;
      }

      console.log("Posts récupérés:", data);
      console.log("Nombre de posts:", data?.length || 0);

      if (data && data.length > 0) {
        data.forEach((post, index) => {
          console.log(`Post ${index + 1}:`, {
            id: post.id,
            title: post.title,
            image_url: post.image_url,
            created_at: post.created_at,
          });
        });
      }

      setUserPosts(data || []);
      setProfile((prev) => ({ ...prev, postsCount: data?.length || 0 }));
    } catch (err) {
      console.error(" Erreur générale loadUserPosts:", err);
      setMessage("Erreur inattendue lors du chargement des posts.");
    } finally {
      setPostsLoading(false);
    }
  };

  // GESTION DES ONGLETS
  const [activeTab, setActiveTab] = useState("posts");
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [isEditingCover, setIsEditingCover] = useState(false);

  // followers/following lists
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  // GESTION DE LA PHOTO DE PROFIL AVEC SUPABASE
  const sanitizeFileName = (name) => {
    return name.replace(/[^a-zA-Z0-9._-]/g, "_");
  };

  // Upload de la photo de profil
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setMessage("");

    try {
      if (!currentUser) {
        setMessage(
          "Vous devez être connecté pour modifier votre photo de profil.",
        );
        setLoading(false);
        return;
      }

      // Uploader l'image dans le bucket avatars de Supabase
      const fileName = sanitizeFileName(
        `${currentUser.id}_${Date.now()}_${file.name}`,
      );

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file);

      if (uploadError) {
        setMessage("Erreur upload : " + uploadError.message);
        setLoading(false);
        return;
      }

      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const avatarUrl = urlData.publicUrl;

      // Mettre à jour la table profiles
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

      //Mettre à jour l'état local
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

  // Upload de la photo de couverture
  const handleCoverUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setMessage("");

    try {
      if (!currentUser) {
        setMessage(
          "Vous devez être connecté pour modifier votre photo de couverture.",
        );
        setLoading(false);
        return;
      }

      console.log("🔄 Upload de la couverture...");

      // Uploader l'image dans le bucket avatars (temporairement, même bucket que profil)
      const fileName = sanitizeFileName(
        `${currentUser.id}_cover_${Date.now()}_${file.name}`,
      );

      const { error: uploadError } = await supabase.storage
        .from("avatars") // Utiliser le bucket avatars qui existe déjà
        .upload(fileName, file);

      if (uploadError) {
        console.error(" Erreur upload couverture:", uploadError);
        setMessage("Erreur upload couverture : " + uploadError.message);
        setLoading(false);
        return;
      }

      console.log("Upload couverture réussi");

      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const coverUrl = urlData.publicUrl;
      console.log(" URL couverture générée:", coverUrl);

      // Mettre à jour la table profiles
      const { error: updateError } = await supabase.from("profiles").upsert({
        id: currentUser.id,
        cover_url: coverUrl,
        updated_at: new Date().toISOString(),
      });

      if (updateError) {
        console.error("❌ Erreur mise à jour couverture:", updateError);
        setMessage("Erreur mise à jour couverture : " + updateError.message);
        setLoading(false);
        return;
      }

      console.log("✅ Couverture mise à jour en base");

      //Mettre à jour l'état local
      setProfile((prev) => ({ ...prev, cover: coverUrl }));
      setMessage("✅ Photo de couverture mise à jour avec succès !");
      setIsEditingCover(false);
    } catch (err) {
      console.error("❌ Erreur upload couverture:", err);
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
        setMessage(
          "Vous devez être connecté pour modifier votre photo de profil.",
        );
        setLoading(false);
        return;
      }

      // Supprimer l'URL de la base de données
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

      //  Mettre à jour l'état local
      setProfile((prev) => ({ ...prev, avatar: null }));
      setProfileImage(null);
      setMessage("✅ Photo de profil supprimée avec succès !");
    } catch (err) {
      console.error("Erreur:", err);
      setMessage("Erreur inattendue lors de la suppression.");
    } finally {
      setLoading(false);
    }
  };

  // update profile counts when lists change
  useEffect(() => {
    setProfile((prev) => ({
      ...prev,
      followers: followersList.length,
      following: followingList.length,
    }));
  }, [followersList.length, followingList.length]);

  //RENDER
  return (
    <div
      className={`flex justify-center py-4 px-4 sm:px-6 lg:px-8 ${isDark ? "bg-gray-900" : "bg-gray-100"}`}
      style={{ minHeight: "calc(100vh - 70px)" }}
    >
      <div
        className={`w-full max-w-5xl border rounded-2xl overflow-hidden shadow-sm ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
      >
        {/* ================= COVER IMAGE ================= */}
        <div className="relative">
          <div
            className="h-56 w-full bg-cover bg-center"
            style={{
              backgroundImage: profile.cover
                ? `url(${profile.cover})`
                : "linear-gradient(135deg, #6d28d9 0%, #7c3aed 50%, #4f46e5 100%)",
            }}
          />

          {/* Bouton pour modifier la couverture */}
          <button
            onClick={() => setIsEditingCover(!isEditingCover)}
            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-lg hover:bg-opacity-70 transition"
          >
            <Settings size={16} />
          </button>
        </div>

        {/* Section édition de la couverture */}
        {isEditingCover && (
          <div
            className={`p-4 border-b ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-200"}`}
          >
            <div className="max-w-5xl mx-auto">
              <h4
                className={`text-sm font-semibold mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}
              >
                Modifier la photo de couverture
              </h4>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  disabled={loading}
                  className={`block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${isDark ? "file:bg-gray-600 file:text-gray-200 hover:file:bg-gray-500" : "file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"} disabled:opacity-50`}
                />
                <button
                  onClick={() => setIsEditingCover(false)}
                  className={`px-4 py-2 rounded-lg transition ${isDark ? "bg-gray-600 text-white hover:bg-gray-500" : "bg-gray-500 text-white hover:bg-gray-600"}`}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-5xl mx-auto px-4">
          {/* ================= HEADER PROFIL ================= */}
          <div className="relative flex flex-col md:flex-row md:items-end md:justify-between mt-6">
            {/* Avatar + Infos */}
            <div className="flex items-end gap-12">
              {/* Avatar */}
              <div className="relative">
                {profile.avatar || profileImage ? (
                  <img
                    src={profile.avatar || profileImage}
                    alt="avatar"
                    className={`w-32 h-32 rounded-full border-4 shadow-lg object-cover -mt-16 ${isDark ? "border-gray-600" : "border-white"}`}
                  />
                ) : (
                  <div
                    className={`w-32 h-32 rounded-full border-4 shadow-lg -mt-16 flex items-center justify-center ${isDark ? "border-gray-600 bg-gray-700" : "border-white bg-gray-300"}`}
                  >
                    <span
                      className={`text-4xl font-bold ${isDark ? "text-gray-300" : "text-gray-600"}`}
                    >
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Bouton pour ajouter/modifier la photo */}
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className={`absolute bottom-0 right-0 p-2 rounded-full transition shadow-lg ${isDark ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-blue-500 text-white hover:bg-blue-600"}`}
                >
                  <Settings size={16} />
                </button>
              </div>

              {/* Nom + username + bio */}
              <div className="space-y-3">
                <h1
                  className={`mb-2 text-2xl font-bold ${isDark ? "text-gray-100" : "text-black"}`}
                >
                  {profile.name}
                </h1>
                <p className={isDark ? "text-gray-400" : "text-gray-500"}>
                  @{profile.username}
                </p>
                <p
                  className={`mt-2 ${isDark ? "text-gray-200" : "text-black"}`}
                >
                  {profile.bio}
                </p>

                {/* Stats */}
                <div
                  className={`flex gap-6 mt-3 text-sm ${isDark ? "text-gray-200" : "text-black"}`}
                >
                  <span>
                    <strong>{profile.postsCount}</strong> Publications
                  </span>
                  <span
                    className="cursor-pointer hover:underline"
                    onClick={() => {
                      setShowFollowers(!showFollowers);
                      setShowFollowing(false);
                    }}
                  >
                    <strong>{profile.followers}</strong> Abonnés
                  </span>
                  <span
                    className="cursor-pointer hover:underline"
                    onClick={() => {
                      setShowFollowing(!showFollowing);
                      setShowFollowers(false);
                    }}
                  >
                    <strong>{profile.following}</strong> Abonnements
                  </span>
                </div>
                {showFollowers && (
                  <div
                    className={`mt-4 max-h-48 overflow-y-auto border p-3 rounded-lg ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}
                  >
                    {followersList.length === 0 ? (
                      <p className={isDark ? "text-gray-400" : "text-gray-500"}>
                        Aucun abonné
                      </p>
                    ) : (
                      followersList.map((u) => (
                        <div
                          key={u.id}
                          className="flex items-center gap-3 mb-2"
                        >
                          {u.avatar_url ? (
                            <img
                              src={u.avatar_url}
                              alt={u.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? "bg-gray-600" : "bg-gray-300"}`}
                            >
                              <span
                                className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}
                              >
                                {u.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span
                            className={`text-sm ${isDark ? "text-gray-200" : "text-gray-700"}`}
                          >
                            {u.name}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
                {showFollowing && (
                  <div
                    className={`mt-4 max-h-48 overflow-y-auto border p-3 rounded-lg ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}
                  >
                    {followingList.length === 0 ? (
                      <p className={isDark ? "text-gray-400" : "text-gray-500"}>
                        Pas d'abonnement
                      </p>
                    ) : (
                      followingList.map((u) => (
                        <div
                          key={u.id}
                          className="flex items-center gap-3 mb-2"
                        >
                          {u.avatar_url ? (
                            <img
                              src={u.avatar_url}
                              alt={u.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? "bg-gray-600" : "bg-gray-300"}`}
                            >
                              <span
                                className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}
                              >
                                {u.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span
                            className={`text-sm ${isDark ? "text-gray-200" : "text-gray-700"}`}
                          >
                            {u.name}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Date d'inscription */}
                <div
                  className={`flex items-center gap-2 mt-2 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  <Calendar size={16} />
                  <span>Inscrit en {profile.joinedAt}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= SECTION ÉDITION PROFIL ================= */}
          {isEditingProfile && (
            <div
              className={`mt-6 p-6 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}
            >
              <h3
                className={`text-lg font-semibold mb-4 ${isDark ? "text-gray-200" : "text-gray-700"}`}
              >
                Gérer la photo de profil
              </h3>

              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                  ></label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={loading}
                    className={`block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${isDark ? "file:bg-gray-600 file:text-gray-200 hover:file:bg-gray-500" : "file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"} disabled:opacity-50`}
                  />
                </div>

                {(profile.avatar || profileImage) && (
                  <div className="flex items-center gap-4">
                    <img
                      src={profile.avatar || profileImage}
                      alt="Aperçu"
                      className={`w-20 h-20 rounded-full object-cover border-2 ${isDark ? "border-gray-600" : "border-gray-300"}`}
                    />
                    <button
                      onClick={handleRemoveImage}
                      disabled={loading}
                      className="px-4 py-2 rounded-lg transition disabled:opacity-50"
                      style={{
                        backgroundColor: isDark ? "#dc2626" : "#ef4444",
                        color: "white",
                      }}
                    >
                      {loading ? "Suppression..." : "Supprimer la photo"}
                    </button>
                  </div>
                )}

                {!profile.avatar && !profileImage && (
                  <p
                    className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Vous n'avez pas encore de photo de profil.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ================= ONGLET ================= */}
          <div className="mt-16 mb-6 px-6">
            {" "}
            {/* ⬅ marge plus grande pour détacher des infos du haut */}
            <div
              className={`text-black font-bold rounded-full p-1 flex ${isDark ? "bg-gray-700 text-gray-200" : "bg-gray-200 text-black"}`}
            >
              <button
                onClick={() => setActiveTab("posts")}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
                  activeTab === "posts"
                    ? isDark
                      ? "bg-gray-800 text-gray-100"
                      : "bg-white text-black"
                    : isDark
                      ? "hover:bg-gray-600"
                      : "hover:bg-gray-400"
                }`}
              >
                Publications
              </button>

  

              <button
                onClick={() => setActiveTab("likes")}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
                  activeTab === "likes"
                    ? isDark
                      ? "bg-gray-800 text-gray-100"
                      : "bg-white text-black"
                    : isDark
                      ? "hover:bg-gray-600"
                      : "hover:bg-gray-400"
                }`}
              >
                Likes
              </button>
            </div>
          </div>

          {/* ================= CONTENU ================= */}
          <div className="mt-6">
            {activeTab === "posts" && (
              <div>
                {postsLoading ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">
                      Chargement des publications...
                    </p>
                  </div>
                ) : userPosts.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">
                      Aucune publication pour le moment.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {userPosts.map((post) => (
                      <div
                        key={post.id}
                        className="aspect-square group relative overflow-hidden rounded-lg bg-gray-200"
                      >
                        {post.image_url ? (
                          <>
                            <div className="relative w-full h-full">
                              <PostImage
                                src={post.image_url}
                                alt={post.title || "Post"}
                                onClick={() =>
                                  console.log("Image cliquée:", post.image_url)
                                }
                              />
                            </div>
                            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-all duration-200 flex items-center justify-center z-10">
                              <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center pointer-events-none">
                                <p className="text-sm font-semibold">
                                  {post.title}
                                </p>
                                <p className="text-xs">
                                  {new Date(post.created_at).toLocaleDateString(
                                    "fr-FR",
                                  )}
                                </p>
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
              <div className="text-center text-gray-500 py-10">
                Aucun contenu aimé.
              </div>
            )}
          </div>
        </div>
      </div>{" "}
      {/* FIN CONTAINER PRINCIPAL */}
    </div>
  );
}
