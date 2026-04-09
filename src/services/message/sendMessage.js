import supabase from "../supabase";
export async function sendMessage(senderId, receiverId, message) {
  try {
    if (message) {
      const { data, error } = await supabase
        .from("messages")
        .insert([
          { sender_id: senderId, receiver_id: receiverId, content: message },
        ]);
      if (error) throw error;
      return data; // utile !
    }
  } catch (error) {
    console.log(`erreur sendMessage ${error}`);
    return null;
  }
}
