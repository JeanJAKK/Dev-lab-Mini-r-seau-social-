import React, { useState, useEffect } from "react";
import supabase from "../services/supabase.js";
import { User, Camera } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import Profile from "./Profil.jsx";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Charger les données de l'utilisateur connecté
  useEffect(() => {
    const loadUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setCurrentUser(user);

          // Récupérer les infos du profil avec avatar
          const { data: profileData } = await supabase
            .from("profiles")
            .select("name, avatar_url")
            .eq("id", user.id)
            .single();

          if (profileData) {
            setUserProfile(profileData);
          }
        }
      } catch (err) {
        console.error("Erreur chargement utilisateur:", err);
      }
    };

    loadUser();
  }, []);

  const displayName =
    userProfile?.name || currentUser?.email?.split("@")[0] || "Utilisateur";
  const avatarUrl =
    userProfile?.avatar_url ||
    `https://ui-avatars.com/api/?name=${displayName}&background=random`;

  const sanitizeFileName = (name) => {
    return name.replace(/[^a-zA-Z0-9._-]/g, "_");
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Vous devez être connecté pour publier.");
        setLoading(false);
        return;
      }

      if (!imageFile) {
        setMessage("Choisissez une image !");
        setLoading(false);
        return;
      }

      const fileName = sanitizeFileName(`${Date.now()}_${imageFile.name}`);

      const { error: uploadError } = await supabase.storage
        .from("posts_images")
        .upload(fileName, imageFile);

      if (uploadError) {
        setMessage("Erreur Upload : " + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("posts_images")
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;

      const { error: insertError } = await supabase.from("posts").insert({
        title,
        content,
        image_url: imageUrl,
        user_id: user.id,
      });

      if (insertError) {
        setMessage("Erreur insertion : " + insertError.message);
        setLoading(false);
        return;
      }

      setMessage("✅ Post publié avec succès !");
      setTitle("");
      setContent("");
      setImageFile(null);
    } catch (err) {
      console.error(err);
      setMessage("Erreur inattendue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${isDark ? "bg-gray-800 border-gray-300" : "bg-white border-gray-300"} rounded-2xl border shadow-sm mb-5 overflow-hidden`}
      style={{ borderColor: isDark ? "#374151" : "#e5e7eb" }}
    >
      <div className="px-5 pt-5 pb-4">
        <form onSubmit={handleCreatePost}>
          <div className="flex gap-4">
            {/* Avatar */}
            <div className="shrink-0">
              <img
                src={avatarUrl}
                alt="profile"
                className={`w-10 h-10 rounded-full border-2 object-cover ${isDark ? "border-gray-500" : "border-gray-300"}`}
              />
            </div>

            {/* Inputs */}
            <div className="flex-1 flex flex-col gap-3">
              <input
                type="text"
                placeholder="Titre du post"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className={`w-full px-4 py-2.5 rounded-xl border text-sm placeholder-gray-400 focus:outline-none focus:ring-1 transition ${isDark ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-gray-400 focus:border-gray-500" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-gray-300 focus:border-gray-300"}`}
              />
              <textarea
                placeholder="Exprime-toi..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border text-sm placeholder-gray-400 focus:outline-none focus:ring-1 transition resize-none leading-relaxed ${isDark ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-gray-400 focus:border-gray-500" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-gray-300 focus:border-gray-300"}`}
              />
            </div>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div
              className={`mt-4 rounded-xl overflow-hidden ${isDark ? "shadow-lg" : "shadow-md"}`}
            >
              <div className={`relative w-full aspect-4/5 ${isDark ? "bg-gray-900" : "bg-gray-100"}`}>
                <img
                  src={imagePreview}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-50"
                />
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="relative z-10 w-full h-full object-contain"
                />
              </div>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="w-full py-2 bg-red-500 text-white font-semibold hover:bg-red-600 transition"
              >
                Supprimer l'image
              </button>
            </div>
          )}

          <div
            className={`flex items-center justify-between mt-6 pt-4 ${isDark ? "border-t border-gray-700" : "border-t border-gray-200"}`}
          >
            <label
              className={`flex items-center gap-2.5 px-4 py-2 rounded-xl cursor-pointer transition group ${isDark ? "bg-gray-700 hover:bg-purple-900" : "bg-gray-50 hover:bg-purple-50"}`}
            >
              <Camera
                size={17}
                className={`${isDark ? "text-gray-400 group-hover:text-purple-400" : "text-gray-400 group-hover:text-purple-600"} transition`}
              />
              <span
                className={`text-sm transition max-w-40 truncate ${isDark ? "text-gray-400 group-hover:text-purple-400" : "text-gray-400 group-hover:text-purple-600"}`}
              >
                {imageFile ? imageFile.name : "Ajouter une image"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-linear-to-r from-blue-400 to-indigo-500 text-white text-sm font-semibold rounded-xl border-none hover:from-blue-700 hover:to-indigo-600 active:scale-[0.97] disabled:opacity-60 transition-all duration-200 shadow-sm"
            >
              {loading ? "Publication..." : "Publier"}
            </button>
          </div>
        </form>

        {message && (
          <p
            className={`mt-3 text-center text-sm font-medium ${message.includes("✅") ? "text-green-600" : "text-red-500"}`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
