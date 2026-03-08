import supabase from "../supabase";

export async function sendComment(userId, postId, content){
  const {data, error} = await supabase.from("comments").insert([{
    post_id: postId,
    user_id : userId,
    content: content 
  }])
  if(error){
    console.log(`erreur commentaire : \n ${error}`)
    return 0;
  }
  console.log("commentaire envoyé");
}