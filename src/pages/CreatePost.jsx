import React, { useState } from "react";
import supabase from "../services/supabase.js";
import "./CreatePost.css";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Fonction pour nettoyer le nom du fichier
  const sanitizeFileName = (name) => {
    return name.replace(/[^a-zA-Z0-9._-]/g, "_");
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (!imageFile) {
        setMessage("❌ Choisissez une image !");
        setLoading(false);
        return;
      }

      // 1️⃣ Générer un nom unique pour le fichier
      const fileName = sanitizeFileName(`${Date.now()}_${imageFile.name}`);

      // 2️⃣ Upload image
      const { error: uploadError } = await supabase
        .storage
        .from("posts_images")
        .upload(fileName, imageFile);

      if (uploadError) {
        setMessage("❌ Erreur Upload : " + uploadError.message);
        setLoading(false);
        return;
      }

      // 3️⃣ URL publique
      const { data: urlData } = supabase
        .storage
        .from("posts_images")
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;

      // 4️⃣ Insertion du post (user_id fictif)
      const { error: insertError } = await supabase
        .from("posts")
        .insert({
          title,
          content,
          image_url: imageUrl,
          user_id: "00000000-0000-0000-0000-000000000000" // user fictif
        });

      if (insertError) {
        setMessage("❌ Erreur insertion : " + insertError.message);
        setLoading(false);
        return;
      }

      // ✅ Post créé avec succès
      setMessage("✅ Post publié avec succès !");
      setTitle("");
      setContent("");
      setImageFile(null);

    } catch (err) {
      console.error(err);
      setMessage("❌ Erreur inattendue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-page">
      <h2>Créer un Post</h2>

      <form onSubmit={handleCreatePost}>
        <input
          type="text"
          placeholder="Titre"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Contenu"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Publication..." : "Publier"}
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
