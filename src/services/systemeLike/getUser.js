import supabase from "../supabase";

export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.log("Erreur récupération user:", error);
    return null; 
  }

  if (user) {
    return user;
    console.log(user);
  } else {
    console.log("Utilisateur non connecté");
    return null;
  }
}