import React, { useState } from "react";
import supabase from "../services/supabase.js";
import { User, Camera } from "lucide-react";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [user] = useState({
    full_name: "Sophie Martin",
    email: "sophie.martin@example.com",
    avatar_url: "https://i.pravatar.cc/300",
  });
  const displayName = user.full_name;
   const avatarUrl =
    user.avatar_url ||
    `https://ui-avatars.com/api/?name=${displayName}&background=random`;


  const sanitizeFileName = (name) => {
    return name.replace(/[^a-zA-Z0-9._-]/g, "_");
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
    <div className="bg-white rounded-2xl! border! border-gray-100! shadow-sm! mb-5! overflow-hidden!">
      <div className="px-5! pt-5! pb-4!">
        <form onSubmit={handleCreatePost}>
          <div className="flex! gap-4!">
            {/* Avatar */}
            <div className="shrink-0!">
              <img
  src={avatarUrl}
  alt="profile"
  className="w-10 h-10 rounded-full border-2 object-cover border-purple-100"
/>
            </div>

            {/* Inputs */}
            <div className="flex-1! flex! flex-col! gap-3!">
              <input
                type="text"
                placeholder="Titre du post"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full! px-4! py-2.5! rounded-xl! bg-gray-50! border! border-gray-200! text-gray-900! text-sm! placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition"
              />
              <textarea
                placeholder="Exprime-toi..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={3}
                className="w-full! px-4! py-3! bg-gray-50! border! border-gray-200! rounded-xl! text-sm! text-gray-900! placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition resize-none! leading-relaxed!"
              />
            </div>
          </div>

          {/* Footer bar */}
          <div className="flex! items-center! justify-between! mt-4! pt-3! border-t! border-gray-100!">
            <label className="flex! items-center! gap-2.5! px-4! py-2! rounded-xl! bg-gray-50! hover:bg-purple-50 cursor-pointer! transition group">
              <Camera size={17} className="text-gray-400 group-hover:text-purple-600 transition" />
              <span className="text-sm! text-gray-400! group-hover:text-purple-600 transition max-w-40! truncate!">
                {imageFile ? imageFile.name : "Ajouter une image"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="hidden!"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="px-6! py-2.5! bg-linear-to-r from-blue-400 to-indigo-500 text-white! text-sm! font-semibold! rounded-xl! border-none! hover:from-blue-700 hover:to-indigo-600 active:scale-[0.97] disabled:opacity-60 transition-all! duration-200 shadow-sm!"
            >
              {loading ? "Publication..." : "Publier"}
            </button>
          </div>
        </form>

        {message && (
          <p className={`mt-3! text-center! text-sm! font-medium! ${message.includes("✅") ? "text-green-600!" : "text-red-500!"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
