import React, { useState } from "react";
import supabase from "../services/supabase.js";
import "./CreatePost.css";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setMessage("");

    
    if (!imageFile) {
      setMessage("Choisissez une image !");
       return;
    }
      function sanitizeFileName(name) {
    return name.replace(/[\[\]\(\)\{\}\#\?\&\%\*\!\@\^\$]/g, "_");
  }
     

    // 2. Générer un nom unique
    const fileName = sanitizeFileName(Date.now() + "_" + imageFile.name);

    // 3. Upload fichier
    const { error: uploadError } = await supabase
      .storage
      .from("posts_images")
      .upload(fileName, imageFile);

    if (uploadError) {
      setMessage("Erreur Upload : " + uploadError.message);
      return;
    }

    // 4. Récupérer URL publique
    const { data: urlData } = supabase
      .storage
      .from("posts_images")
      .getPublicUrl(fileName);

    const imageUrl = urlData.publicUrl;

    // 5. Insert dans la table
    const { error: insertError } = await supabase.auth.getUser()
      await supabase.from("posts").insert({
        title,
        content,
        image_url: imageUrl,
        user_id: user.id
      });

    if (insertError) {
      setMessage("Erreur d'insertion : " + insertError.message);
      return;
    }

    setMessage("Post créé avec succès !");
    setTitle("");
    setContent("");
    setImageFile(null);
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
        />

        <textarea
          placeholder="Contenu"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Publication..." : "Publier"}
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>

  );
}
