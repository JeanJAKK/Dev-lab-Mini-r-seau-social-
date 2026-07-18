import { useState, useEffect } from 'react';
import supabase from '../services/supabase.js';
import { getMessages, sendMessage } from '../services/messages.service';

export function useMessages(senderId, receiverId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!senderId || !receiverId) return;

    // 1. Chargement initial
    getMessages(senderId, receiverId)
      .then(setMessages)
      .finally(() => setLoading(false));

    // 2. Souscription realtime — écoute les messages dans les deux sens
    const channel = supabase
      .channel(`messages:${senderId}-${receiverId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const msg = payload.new;
          const concerneCetteConv =
            (msg.sender_id === senderId && msg.receiver_id === receiverId) ||
            (msg.sender_id === receiverId && msg.receiver_id === senderId);

          if (concerneCetteConv) {
            setMessages((prev) => [...prev, msg]);
          }
        }
      )
      .subscribe();

    // 3. Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, [senderId, receiverId]);

  const envoyerMessage = async (content) => {
    await sendMessage(senderId, receiverId, content);
  };

  return { messages, loading, envoyerMessage };
}