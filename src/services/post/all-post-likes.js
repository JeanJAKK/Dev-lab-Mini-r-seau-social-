import supabase from "../supabase";
export async function likesData (){
  //  Récupérer tous les likes pour tous les posts
    const { data: likesData, error: likesError } = await supabase
      .from("likes")
      .select("*"); // on prend post_id et user_id

    if (likesError) throw likesError;
    return likesData
}