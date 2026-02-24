import React, { useState } from "react";
import supabase from "../services/supabase.js";
import { Link } from "react-router-dom";
import { User, Camera } from "lucide-react";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div className="justify-center items-center  flex">
      <div className="bg-white md:w-[700px]  border w-[396px] rounded-xl shadow-sm">
        <form onSubmit={handleCreatePost} className="md:border-8 rounded-2xl border-white">
          <div className="flex gap-5 h-40">
            <p className="text-black border hover:text-purple-600 transition h-10 w-12 items-center flex justify-center rounded-full">
              <Link to="profile" className="">
                <User size={24} />
              </Link>
            </p>
            <div className="flex gap-2 w-full flex-col">
              <input
                type="text"
                placeholder="Titre du post"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="h-8 rounded bg-gray-50 border-gray-300 border text-gray-900 transition-all"
              />

              <textarea
                placeholder="Exprime-toi..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={3}
                className="h-28 p-4 bg-gray-50 border-gray-300 border  rounded text-gray-900 placeholder-gray-400 transition-all resize-none"
              />
            </div>
          </div>
          <div className="flex justify-between">
            <label className="flex px-4 py-3 bg-gray-50 cursor-pointer hover:border-blue-400 transition-all group">
              <span className="text-sm text-black group-hover:text-blue-600">
                {imageFile ? imageFile.name : ""}
                <Camera />
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="hidden"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-400 w-30 h-10 text-white py-3.5 rounded font-semibold hover:bg-blue-700 active:scale-[0.98] disabled:bg-blue-300 disabled:active:scale-100 transition-all duration-200"
            >
              {loading ? "Publication..." : "Publier"}
            </button>
          </div>
        </form>

        {message && (
          <p
            className={`mt-4 text-center text-sm font-medium ${message.includes("✅") ? "text-green-600" : "text-red-500"}`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
