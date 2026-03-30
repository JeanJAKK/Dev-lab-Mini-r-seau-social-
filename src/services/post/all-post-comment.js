import supabase from "../supabase";
export async function CommentsData(){
    // Recupérer tous les commentaires

    const { data: commentData, error: commentError } = await supabase
      .from("comments")
      .select("*");
    if (commentError) throw commentError;
    return commentData;
}