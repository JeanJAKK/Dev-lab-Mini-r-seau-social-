import { useState, useEffect } from 'react';
import supabase from '../services/supabase.js';
import { getMessages, sendMessage } from '../services/messages.service';

export function useMessages(senderId, receiverId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setMessages([]);
    setError(null);
    setLoading(Boolean(senderId && receiverId));

    if (!senderId || !receiverId) return undefined;

    const addMessage = (message) => {
      setMessages((previous) => {
        const messageId = message.idmessage ?? message.id;
        const alreadyExists = messageId
          ? previous.some((item) => (item.idmessage ?? item.id) === messageId)
          : previous.some(
              (item) =>
                item.sender_id === message.sender_id &&
                item.receiver_id === message.receiver_id &&
                item.created_at === message.created_at,
            );

        if (alreadyExists) return previous;

        return [...previous, message].sort(
          (first, second) =>
            new Date(first.created_at).getTime() -
            new Date(second.created_at).getTime(),
        );
      });
    };

    getMessages(senderId, receiverId)
      .then((initialMessages) => {
        if (!active) return;
        initialMessages.forEach(addMessage);
      })
      .catch((loadError) => {
        if (active) setError(loadError);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const channel = supabase
      .channel(`messages:${[senderId, receiverId].sort().join('-')}`)
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

          if (concerneCetteConv) addMessage(msg);
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [senderId, receiverId]);

  const envoyerMessage = async (content) => {
    if (!senderId || !receiverId || !content?.trim()) return;

    setSending(true);
    setError(null);
    try {
      const sentMessage = await sendMessage(senderId, receiverId, content.trim());
      setMessages((previous) => {
        const messageId = sentMessage.idmessage ?? sentMessage.id;
        if (messageId && previous.some((item) => (item.idmessage ?? item.id) === messageId)) {
          return previous;
        }
        return [...previous, sentMessage].sort(
          (first, second) =>
            new Date(first.created_at).getTime() -
            new Date(second.created_at).getTime(),
        );
      });
      return sentMessage;
    } catch (sendError) {
      setError(sendError);
      throw sendError;
    } finally {
      setSending(false);
    }
  };

  return { messages, loading, sending, error, envoyerMessage };
}