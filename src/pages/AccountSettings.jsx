// ===============================
// AccountSettings.jsx
// Page de paramètres du compte
// ===============================

import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  Settings,
  User,
  Trash2,
  Edit,
  Save,
  X,
  Calendar,
  Mail,
} from "lucide-react";
import supabase from "../services/supabase.js";
import { getUser } from "../services/systemeLike/getUserId.js";

export default function AccountSettings() {
  // États pour les posts
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);

  // États pour l'édition
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null); // ✅ null par défaut

  // Formulaire d'édition du profil
  const [profileForm, setProfileForm] = useState({
    name: "",
    username: "",
    bio: "",
  });

  const { theme } = useTheme();
  const isDark = theme === "dark";

  // États pour les informations du profil
  const [profile, setProfile] = useState({
    username: "",
    bio: "",
    updated_at: "",
  });

  // ✅ Chargement de l'utilisateur au montage
  useEffect(() => {
    const init = async () => {
      const currentUser = await getUser();
      setUser(currentUser);
    };
    init();
  }, []);

  // ✅ Chargement des données une fois l'utilisateur disponible
  useEffect(() => {
    if (user) {
      loadProfileData();
      loadUserPosts();
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      if (!user) {
        setMessage("Vous devez être connecté pour accéder aux paramètres.");
        return;
      }

      // Charger le profil
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Erreur profil:", profileError);
        setMessage("Erreur lors du chargement du profil.");
        return;
      }

      if (profileData) {
        setProfile(profileData);
        setProfileForm({
          name: profileData.name || "",
          username: profileData.username || "",
          bio: profileData.bio || "",
        });
      }

      // Récupérer l'email depuis auth
      setProfile((prev) => ({ ...prev, email: user.email }));
    } catch (err) {
      console.error("Erreur générale:", err);
      setMessage("Erreur inattendue lors du chargement.");
    }
  };

  const loadUserPosts = async () => {
    setPostsLoading(true);
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur chargement posts:", error);
        setMessage("Erreur lors du chargement des publications.");
        return;
      }

      setUserPosts(data || []);
    } catch (err) {
      console.error("Erreur générale loadUserPosts:", err);
      setMessage("Erreur inattendue lors du chargement des posts.");
    } finally {
      setPostsLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (!user) {
        setMessage("Vous devez être connecté.");
        setLoading(false);
        return;
      }

      // Vérifier si le username est déjà pris (si modifié)
      if (profileForm.username !== profile.username) {
        const { data: existingUser } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", profileForm.username)
          .neq("id", user.id)
          .single();

        if (existingUser) {
          setMessage("Ce nom d'utilisateur est déjà pris.");
          setLoading(false);
          return;
        }
      }

      // Mettre à jour le profil
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        name: profileForm.name,
        username: profileForm.username,
        bio: profileForm.bio,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        setMessage("Erreur lors de la mise à jour: " + error.message);
        setLoading(false);
        return;
      }

      setProfile((prev) => ({
        ...prev,
        name: profileForm.name,
        username: profileForm.username,
        bio: profileForm.bio,
        updated_at: new Date().toISOString(),
      }));

      setMessage("✅ Profil mis à jour avec succès !");
      setIsEditingProfile(false);
    } catch (err) {
      console.error("Erreur:", err);
      setMessage("Erreur inattendue lors de la mise à jour.");
    } finally {
      setLoading(false);
    }
  };

  const handlePostEdit = (post) => {
    setEditingPost({
      ...post,
      title: post.title || "",
      content: post.content || "",
    });
  };

  const handlePostUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase
        .from("posts")
        .update({
          title: editingPost.title,
          content: editingPost.content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingPost.id);

      if (error) {
        setMessage("Erreur lors de la mise à jour du post: " + error.message);
        setLoading(false);
        return;
      }

      // Mettre à jour l'état local
      setUserPosts((prev) =>
        prev.map((post) =>
          post.id === editingPost.id
            ? {
                ...post,
                title: editingPost.title,
                content: editingPost.content,
              }
            : post,
        ),
      );

      setMessage("✅ Post mis à jour avec succès !");
      setEditingPost(null);
    } catch (err) {
      console.error("Erreur:", err);
      setMessage("Erreur inattendue lors de la mise à jour du post.");
    } finally {
      setLoading(false);
    }
  };

  const handlePostDelete = async (postId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce post ?")) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId);

      if (error) {
        setMessage("Erreur lors de la suppression du post: " + error.message);
        setLoading(false);
        return;
      }

      // Mettre à jour l'état local
      setUserPosts((prev) => prev.filter((post) => post.id !== postId));
      setMessage("✅ Post supprimé avec succès !");
    } catch (err) {
      console.error("Erreur:", err);
      setMessage("Erreur inattendue lors de la suppression.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"} py-8 flex items-center justify-center`}
    >
      <div
        className={`w-full max-w-4xl mx-auto ${isDark ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-lg overflow-hidden border ${isDark ? "border-gray-700" : "border-gray-200"}`}
      >
        {/* Header */}
        <div
          className={`p-6 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}
        >
          <div className="flex items-center gap-3">
            <Settings
              className={isDark ? "text-gray-300" : "text-gray-600"}
              size={24}
            />
            <h1
              className={`text-2xl font-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}
            >
              Paramètres du compte
            </h1>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`p-4 text-center text-sm font-medium ${
              message.includes("✅")
                ? isDark
                  ? "text-green-400 bg-green-900/20"
                  : "text-green-600 bg-green-50"
                : isDark
                  ? "text-red-400 bg-red-900/20"
                  : "text-red-600 bg-red-50"
            }`}
          >
            {message}
          </div>
        )}

        {/* Section Profil */}
        <div
          className={`p-6 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <User
                className={isDark ? "text-gray-400" : "text-gray-600"}
                size={20}
              />
              <h2
                className={`text-xl font-semibold ${isDark ? "text-gray-100" : "text-gray-900"}`}
              >
                Informations du profil
              </h2>
            </div>
            <button
              onClick={() => {
                setIsEditingProfile(!isEditingProfile);
                if (isEditingProfile) {
                  setProfileForm({
                    name: profile.name,
                    username: profile.username,
                    bio: profile.bio,
                  });
                }
              }}
              className={`px-4 py-2 mb-2 rounded-lg transition ${
                isDark
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {isEditingProfile ? "Annuler" : "Modifier"}
            </button>
          </div>

          {!isEditingProfile ? (
            <div className="space-y-6">
              <div
                className={`p-4 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}
              >
                <p
                  className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
                >
                  Nom
                </p>
                <p
                  className={`font-medium ${isDark ? "text-gray-200" : "text-gray-900"}`}
                >
                  {profile.name || "Non défini"}
                </p>
              </div>
              <div
                className={`p-4 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}
              >
                <p
                  className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
                >
                  Nom d'utilisateur
                </p>
                <p
                  className={`font-medium ${isDark ? "text-gray-200" : "text-gray-900"}`}
                >
                  @{profile.username || "Non défini"}
                </p>
              </div>
              <div
                className={`p-4 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}
              >
                <p
                  className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
                >
                  Bio
                </p>
                <p
                  className={`font-medium ${isDark ? "text-gray-200" : "text-gray-900"}`}
                >
                  {profile.bio || "Non définie"}
                </p>
              </div>
              <div
                className={`p-4 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}
              >
                <p
                  className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
                >
                  Email
                </p>
                <p
                  className={`font-medium ${isDark ? "text-gray-200" : "text-gray-900"}`}
                >
                  {profile.email}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  Nom
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  required
                  placeholder="Votre nom"
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium my-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  value={profileForm.username}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      username: e.target.value.replace(/\s/g, ""),
                    }))
                  }
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  required
                  pattern="[a-zA-Z0-9_]+"
                  title="Lettres, chiffres et underscore uniquement"
                  placeholder="nom_utilisateur"
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium my-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  Bio
                </label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="Décrivez-vous..."
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-2 rounded-lg transition ${
                    isDark
                      ? "bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                      : "bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
                  }`}
                >
                  {loading ? "Enregistrement..." : "Enregistrer"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingProfile(false);
                    setProfileForm({
                      name: profile.name,
                      username: profile.username,
                      bio: profile.bio,
                    });
                  }}
                  className={`px-6 py-2 rounded-lg transition ${
                    isDark
                      ? "bg-gray-600 text-white hover:bg-gray-700"
                      : "bg-gray-500 text-white hover:bg-gray-600"
                  }`}
                >
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Section Posts */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Edit
              className={isDark ? "text-gray-400" : "text-gray-600"}
              size={20}
            />
            <h2
              className={`text-xl font-semibold ${isDark ? "text-gray-100" : "text-gray-900"}`}
            >
              Mes publications
            </h2>
          </div>

          {postsLoading ? (
            <div className="text-center py-8">
              <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                Chargement...
              </p>
            </div>
          ) : userPosts.length === 0 ? (
            <div
              className={`text-center py-8 ${isDark ? "bg-gray-700" : "bg-gray-50"} rounded-lg`}
            >
              <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                Vous n'avez aucune publication
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {userPosts.map((post) => (
                <div
                  key={post.id}
                  className={`p-4 rounded-lg border ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}
                >
                  {editingPost?.id === post.id ? (
                    <form onSubmit={handlePostUpdate} className="space-y-3">
                      <input
                        type="text"
                        value={editingPost.title}
                        onChange={(e) =>
                          setEditingPost((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark
                            ? "bg-gray-600 border-gray-500 text-gray-200 focus:border-blue-500"
                            : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        required
                        placeholder="Titre de la publication"
                      />
                      <textarea
                        value={editingPost.content}
                        onChange={(e) =>
                          setEditingPost((prev) => ({
                            ...prev,
                            content: e.target.value,
                          }))
                        }
                        rows={3}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDark
                            ? "bg-gray-600 border-gray-500 text-gray-200 focus:border-blue-500"
                            : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        required
                        placeholder="Contenu de la publication"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className={`px-4 py-1 text-sm rounded-lg transition ${
                            isDark
                              ? "bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                              : "bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
                          }`}
                        >
                          {loading ? "Enregistrement..." : "Enregistrer"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingPost(null)}
                          className={`px-4 py-1 text-sm rounded-lg transition ${
                            isDark
                              ? "bg-gray-600 text-white hover:bg-gray-700"
                              : "bg-gray-500 text-white hover:bg-gray-600"
                          }`}
                        >
                          Annuler
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div>
                      <h3
                        className={`font-semibold mb-2 ${isDark ? "text-gray-100" : "text-gray-900"}`}
                      >
                        {post.title}
                      </h3>
                      <p
                        className={`text-sm mb-3 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                      >
                        {post.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <div
                          className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                        >
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(post.created_at).toLocaleDateString(
                              "fr-FR",
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePostEdit(post)}
                            className={`px-3 py-1 text-sm rounded-lg transition ${
                              isDark
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-blue-500 text-white hover:bg-blue-600"
                            }`}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handlePostDelete(post.id)}
                            disabled={loading}
                            className={`px-3 py-1 text-sm rounded-lg transition ${
                              isDark
                                ? "bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                                : "bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                            }`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}