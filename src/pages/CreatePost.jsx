import React, { useState } from "react";
import supabase from "../services/supabase.js";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setMessage("");

    // 1. Vérifier l’image
    if (!imageFile) {
      setMessage("Choisissez une image !");
      return;
    }

    // 2. Générer un nom unique
    const fileName = `${Date.now()}_${imageFile.name}`;

    // 3. Upload fichier
    const { error: uploadError } = await supabase
      .storage
      .from("images_posts")
      .upload(fileName, imageFile);

    if (uploadError) {
      setMessage("Erreur Upload : " + uploadError.message);
      return;
    }

    // 4. Récupérer URL publique
    const { data: urlData } = supabase
      .storage
      .from("images_posts")
      .getPublicUrl(fileName);

    const imageUrl = urlData.publicUrl;

    // 5. Insert dans la table
    const { error: insertError } = await supabase
      .from("posts")
      .insert({
        title,
        content,
        image_url: imageUrl,
        user_id: "id_utilisateur_test"
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
    
    <div style={{
      backgroundColor: "yellow",
      color: "black",
      padding: "20px",
      fontSize: "22px"
    }}>
      <h1>Create Post OK</h1>
      <p>Le texte est visible maintenant.</p>
    </div>

  );
}
