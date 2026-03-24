import supabase from './supabase.js'; 

export const addNotification = async (senderId, receiverId, type, postId, content) => {
  if (senderId === receiverId) return;

  console.log("Tentative d'insertion notification :", { senderId, receiverId, type, postId });

  const { data, error } = await supabase.from('notifications').insert([
    {
      sender_id: senderId,
      user_id: receiverId,
      type: type,
      post_id: postId,
      content: content,
      is_read: false
    }
  ]);
  
  if (error) {
    console.error("ERREUR lors de l'ajout de la notification :", error);
  } else {
    console.log("Succès ! Notification ajoutée en base :", data);
  }
};