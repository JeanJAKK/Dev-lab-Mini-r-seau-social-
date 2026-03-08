import supabase from "../supabase";

export async function getUserId() {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.log("Erreur récupération user:", error);
    return null; 
  }

  if (user) {
    return user.id;
  } else {
    console.log("Utilisateur non connecté");
    return null;
  }
}