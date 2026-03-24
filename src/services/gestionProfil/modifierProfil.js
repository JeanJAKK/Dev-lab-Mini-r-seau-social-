import supabase from "../supabase";

export async function updateUser(userId, name, email) {

  const { data, error } = await supabase
    .from("profiles")
    .update({ name: name, email: email})
    .eq("id", userId)
    .select();

  if (error) {
    console.log(`Erreur : ${error} \n sur update`);
    return null;
  }

  console.log("profil mis à jour :", data);
  return data;
}