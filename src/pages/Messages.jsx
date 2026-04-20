import React, { useEffect, useState } from "react";
import { Send, ArrowLeft, MessageSquare, Clock3, Target } from "lucide-react";
import supabase from "../services/supabase.js";
import { getUser } from "../services/systemeLike/getUser.js";
import { getMessage } from "../services/message/getMessages.js";
import { sendMessage } from "../services/message/sendMessage.js";

export default function Messages() {
  const [users, setUsers] = useState([]);
  const [myId, setMyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messageInfos, setMessageInfos] = useState([]);

  const conversationMessages = selectedUser ? messageInfos
    .filter((msg) =>
      (msg.sender_id === myId && msg.receiver_id === selectedUser.id) ||
      (msg.sender_id === selectedUser.id && msg.receiver_id === myId)
    )
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) : [];

  const handleSendMessage = async () => {
    const cleaned = message.trim();
    if (!cleaned || !myId || !selectedUser) return;

    await sendMessage(myId, selectedUser.id, cleaned);
    setMessageInfos((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender_id: myId,
        receiver_id: selectedUser.id,
        content: cleaned,
        created_at: new Date().toISOString(),
      },
    ]);
    setMessage("");
  };

  const getUsers = async (currentUserId) => {
    if (!currentUserId) return;
    setLoading(true);

    // 1. Récupérer les ID des utilisateurs que l'on suit
    const { data: followsData, error: followsError } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", currentUserId);

    if (followsError) {
      console.error("Erreur chargement abonnements:", followsError);
      setLoading(false);
      return;
    }

    const followingIds = followsData.map((f) => f.following_id);

    // Si on ne suit personne, on arrête là et on vide la liste
    if (followingIds.length === 0) {
      setUsers([]);
      setLoading(false);
      return;
    }

    // 2. Récupérer uniquement les profils des personnes suivies
    const { data, error } = await supabase
      .from("profiles")
      .select(`id, name, avatar_url`)
      .in("id", followingIds)
      .order("name", { ascending: true });

    if (!error && data) {
      setUsers(data);
    } else if (error) {
      console.error("Erreur chargement profils:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      const user = await getUser();
      if (user && user.id) {
        setMyId(user.id);
        getUsers(user.id);
      } else {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      const msg = await getMessage();
      if (msg) setMessageInfos(msg);
    };
    fetchMessages();
  }, []);

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)] sm:min-h-[calc(100vh-110px)] w-full max-w-5xl mx-auto bg-white sm:rounded-xl shadow-md border-y sm:border border-gray-200 overflow-hidden sm:my-4 relative">
      {/* Sidebar: Liste des discussions */}
      <div
        className={`flex-col border-r border-gray-200 bg-gray-50/80 shrink-0 absolute sm:relative inset-0 z-20 transition-transform ${selectedUser ? "hidden sm:flex sm:w-[300px] lg:w-[320px]" : "flex w-full sm:w-[300px] lg:w-[320px]"}`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center bg-white h-[60px]">
          <h2 className="text-lg font-bold text-gray-800">Discussions</h2>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {loading ? (
            // Skeleton loaders natif Tailwind
            [1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 animate-pulse"
              >
                <div className="w-10 h-10 bg-gray-300 rounded-full " />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-300 rounded w-1/2" />
                  <div className="h-2 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            ))
          ) : users.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-gray-500 mb-2">
                Vous ne suivez personne pour le moment.
              </p>
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`flex items-center gap-3.5 p-3.5 rounded-xl cursor-pointer transition-all duration-200 mx-2 ${
                  selectedUser?.id === user.id ? "bg-gradient-to-r from-purple-100 to-pink-100 shadow-md" : "hover:bg-gray-100"
                }`}
              >
                <div className="relative shrink-0">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-gray-200 shadow-md"
                    />
                  ) : (
                    <div className="w-11 h-11 flex justify-center items-center bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700 font-bold rounded-full border-2 border-gray-200 text-base shadow-md">
                      {user.name?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {user.name}
                  </p>
                  <p
                    className={`text-xs truncate ${selectedUser?.id === user.id ? "text-purple-600" : "text-gray-500"}`}
                  >
                    Appuyez pour écrire...
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Zone principale de chat */}
      <div
        className={`flex-col bg-white min-w-0 w-full ${selectedUser ? "fixed inset-0 z-30 flex sm:relative sm:inset-auto sm:z-auto" : "hidden sm:flex"}`}
      >
        {!selectedUser ? (
          // État vide (affiché uniquement sur les grands écrans car masqué sur mobile sans selectedUser)
          <div className="flex-1 flex-col justify-center items-center bg-gray-50/50 p-6 hidden sm:flex">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4 text-purple-600 shadow-inner">
              <MessageSquare size={32} className="opacity-80" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              Vos messages
            </h3>
            <p className="text-sm text-gray-500 max-w-sm text-center">
              Sélectionnez un contact dans la liste à gauche pour démarrer une
              conversation en privé.
            </p>
          </div>
        ) : (
          // Discussion active
          <>
            {/* En-tête du chat */}
            <div className="h-16 border-b border-gray-200 flex items-center gap-3 px-4 sm:px-6 bg-white shrink-0 z-10 shadow-sm">
              <button
                onClick={() => setSelectedUser(null)}
                className="sm:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
              >
                <ArrowLeft size={22} />
              </button>
              <div className="relative shrink-0">
                {selectedUser.avatar_url ? (
                  <img
                    src={selectedUser.avatar_url}
                    alt={selectedUser.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-gray-200 shadow-md"
                  />
                ) : (
                  <div className="w-11 h-11 flex justify-center items-center bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700 font-bold rounded-full border-2 border-gray-200 text-sm shadow-md">
                    {selectedUser.name?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-base truncate">
                  {selectedUser.name}
                </p>
                <p className="text-xs text-gray-500">Actif à l'instant</p>
              </div>
            </div>

            {/* Zone des messages (scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-gradient-to-b from-gray-50 to-white flex flex-col gap-4 relative">
              <div className="text-center my-4">
                <span className="text-xs font-semibold text-gray-500 bg-gray-200/70 px-4 py-1.5 rounded-full shadow-sm">
                  Début de la conversation avec {selectedUser.name}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {conversationMessages.length === 0 ? (
                  <div className="text-center text-sm text-gray-500 mt-12">
                    <MessageSquare size={32} className="mx-auto mb-3 text-gray-300" />
                    Aucune conversation avec {selectedUser.name} pour le moment.
                  </div>
                ) : (
                  conversationMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender_id === myId ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`rounded-2xl px-5 py-3.5 max-w-[85%] break-words shadow-md ${
                          msg.sender_id === myId
                            ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-br-lg"
                            : "bg-white text-gray-900 rounded-bl-lg border-2 border-gray-200"
                        }`}
                      >
                        <p className="text-sm leading-relaxed font-medium">{msg.content}</p>
                        <span
                          className={`block text-xs mt-2.5 text-right ${
                            msg.sender_id === myId
                              ? "text-purple-100"
                              : "text-gray-400"
                          }`}
                        >
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Barre de saisie */}
            <div className="bg-white border-t-2 border-gray-200 shrink-0 p-4 sm:p-5">
              <div className="flex items-center gap-2.5 bg-gradient-to-r from-gray-100 to-gray-50 px-4 py-2.5 rounded-2xl border-2 border-gray-200 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-200 focus-within:bg-white shadow-sm transition-all">
                <input
                  type="text"
                  value={message}
                  placeholder={`Envoyer un message à ${selectedUser.name}...`}
                  className="flex-1 bg-transparent px-1.5 py-1 outline-none text-sm text-gray-800 placeholder-gray-500 font-medium"
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <button
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex justify-center items-center w-10 h-10 rounded-full shadow-lg active:scale-90 shrink-0 transition-all font-semibold"
                  title="Envoyer"
                  onClick={handleSendMessage}
                >
                  <Send size={16} className="translate-x-px" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
