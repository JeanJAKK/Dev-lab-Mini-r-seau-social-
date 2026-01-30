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
    //  Vérifier utilisateur connecté
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setMessage(" Vous devez être connecté pour publier.");
      setLoading(false);
      return;
    }

    if (!imageFile) {
      setMessage("Choisissez une image !");
      setLoading(false);
      return;
    }

    // Nom unique du fichier
    const fileName = sanitizeFileName(`${Date.now()}_${imageFile.name}`);

    // Upload image
    const { error: uploadError } = await supabase
      .storage
      .from("posts_images")
      .upload(fileName, imageFile);

    if (uploadError) {
      setMessage("Erreur Upload : " + uploadError.message);
      setLoading(false);
      return;
    }

    // URL publique
    const { data: urlData } = supabase
      .storage
      .from("posts_images")
      .getPublicUrl(fileName);

    const imageUrl = urlData.publicUrl;

    // Insertion du post (user réel)
    const { error: insertError } = await supabase
      .from("posts")
      .insert({
        title,
        content,
        image_url: imageUrl,
        user_id: user.id
      });

    if (insertError) {
      setMessage("Erreur insertion : " + insertError.message);
      setLoading(false);
      return;
    }

    //  Succès
    setMessage("✅ Post publié avec succès !");
    setTitle("");
    setContent("");
    setImageFile(null);

  } catch (err) {
    console.error(err);
    setMessage(" Erreur inattendue");
  } finally {
    setLoading(false);
  }
};


return (
  <div className="create-post-page">
    <div className="create-post-card">
      <h2 className="create-post-title">Créer un post</h2>

      <form onSubmit={handleCreatePost} className="create-post-form">
        <input
          type="text"
          className="create-post-input"
          placeholder="Titre du post"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          className="create-post-textarea"
          placeholder="Exprime-toi..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        <label className="file-label">
          Choisir une image
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            hidden
          />
        </label>

        <button type="submit" className="create-post-btn" disabled={loading}>
          {loading ? "Publication..." : "Publier"}
        </button>
      </form>

      {message && <p className="create-post-message">{message}</p>}
    </div>
  </div>
);

}
