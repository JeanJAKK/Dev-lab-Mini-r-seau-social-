//Fichier contenant les opérayions de CRUD sur les messages et le realtime
import supabase from "../services/supabase.js";

export async function getMessages(senderId, receiverId) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`,
    )
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function sendMessage(senderId, receiverId, content) {
  const { data, error } = await supabase
    .from("messages")
    .insert({ sender_id: senderId, receiver_id: receiverId, content: content })
    .select()
    .single();

  if (error) throw error;
  return data;
}
