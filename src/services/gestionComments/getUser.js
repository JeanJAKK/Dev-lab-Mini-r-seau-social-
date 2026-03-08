import supabase from "../supabase";

export async function getUser(){
  const {data: { user }, error} = await supabase.auth.getUser();
  if(error){
    console.log("erreur sur getUser : "+ error);
    return null
  }
  const { data, err} = supabase.from("profiles").select("*").eq("email", user.email).single();
  if(err){
    console.log(`Erreur lors de lobtention du user : ${err}`);
    return null
  }
  return data
}