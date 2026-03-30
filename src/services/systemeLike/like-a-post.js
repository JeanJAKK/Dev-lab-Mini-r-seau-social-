import supabase from "../supabase";
import { getPostLikes } from "./getPostLikes";

export async function like(postId, userId, isLiked) {
  try {
    if (isLiked) {
      // Supprimer le like
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("user_id", userId)
        .eq("post_id", postId);

      if (error) throw error;

    } else {
      // Ajouter le like sans dupliquer
      const { error } = await supabase
        .from("likes")
        .upsert(
          [{ post_id: postId, user_id: userId }],
          { onConflict: ["post_id", "user_id"] }
        );

      if (error) throw error;
    }

    // Récupérer le nombre réel de likes après modification
    const count = await getPostLikes(postId);
    return count;

  } catch (err) {
    console.error("Erreur like:", err);
    return null;
  }
}