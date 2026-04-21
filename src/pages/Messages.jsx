import React, { useEffect, useState } from "react";
import { Send, ArrowLeft, MessageSquare } from "lucide-react";
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

  const getUsers = async (currentUserId) => {
    if (!currentUserId) return;
    setLoading(true);

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

    if (followingIds.length === 0) {
      setUsers([]);
      setLoading(false);
      return;
    }

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
      setMessageInfos(msg);
    };
    fetchMessages();
  }, []);

  const conversationMessages = selectedUser
    ? messageInfos.filter(
        (msg) =>
          (msg.sender_id === myId && msg.receiver_id === selectedUser.id) ||
          (msg.sender_id === selectedUser.id && msg.receiver_id === myId)
      )
    : [];

  return (
    <div className="flex h-[calc(100vh-160px)] sm:h-[calc(100vh-110px)] w-full max-w-5xl mx-auto bg-white sm:rounded-xl shadow-md border-y sm:border border-gray-200 overflow-hidden sm:my-4">

      {/* ── Sidebar contacts ── */}
      <div
        className={`
          flex flex-col border-r border-gray-200 bg-gray-50/50 shrink-0
          transition-all duration-300
          ${selectedUser
            /* Mobile : masquée quand une conv est ouverte */
            ? "hidden sm:flex sm:w-[260px] lg:w-[320px]"
            /* Mobile : plein écran quand aucune conv */
            : "flex w-full sm:w-[260px] lg:w-[320px]"
          }
        `}
      >
        <div className="p-4 border-b border-gray-200 flex items-center bg-white h-[60px]">
          <h2 className="text-lg font-bold text-gray-800">Discussions</h2>
        </div>

        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {loading ? (
            [1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                <div className="w-10 h-10 bg-gray-300 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-300 rounded w-1/2" />
                  <div className="h-2 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            ))
          ) : users.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-gray-500">
                Vous ne suivez personne pour le moment.
              </p>
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedUser?.id === user.id
                    ? "bg-purple-100"
                    : "hover:bg-gray-100"
                }`}
              >
                <div className="relative shrink-0">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-10 h-10 flex justify-center items-center bg-purple-100 text-purple-700 font-bold rounded-full border border-gray-200 text-base">
                      {user.name?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {user.name}
                  </p>
                  <p
                    className={`text-xs truncate ${
                      selectedUser?.id === user.id
                        ? "text-purple-600"
                        : "text-gray-500"
                    }`}
                  >
                    Appuyez pour écrire…
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Zone de chat (toujours à droite sur desktop) ── */}
      <div
        className={`
          flex flex-col bg-white min-w-0
          /* Desktop : toujours visible, flex-1 pour occuper le reste */
          sm:flex sm:flex-1
          /* Mobile : visible seulement quand une conv est sélectionnée */
          ${selectedUser ? "flex flex-1" : "hidden"}
        `}
      >
        {!selectedUser ? (
          /* État vide – desktop uniquement */
          <div className="flex-1 flex flex-col justify-center items-center bg-gray-50/50 p-6">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4 text-purple-600 shadow-inner">
              <MessageSquare size={32} className="opacity-80" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Vos messages</h3>
            <p className="text-sm text-gray-500 max-w-sm text-center">
              Sélectionnez un contact dans la liste à gauche pour démarrer une
              conversation en privé.
            </p>
          </div>
        ) : (
          <>
            {/* En-tête du chat */}
            <div className="h-[60px] border-b border-gray-200 flex items-center gap-3 px-4 sm:px-6 bg-white shrink-0">
              <button
                onClick={() => setSelectedUser(null)}
                className="sm:hidden p-2 -ml-2 rounded-full text-gray-500 hover:bg-gray-100 transition"
              >
                <ArrowLeft size={20} />
              </button>

              <div className="relative shrink-0">
                {selectedUser.avatar_url ? (
                  <img
                    src={selectedUser.avatar_url}
                    alt={selectedUser.name}
                    className="w-9 h-9 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-9 h-9 flex justify-center items-center bg-purple-100 text-purple-700 font-bold rounded-full border border-gray-200 text-sm">
                    {selectedUser.name?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                )}
              </div>

              <p className="font-bold text-gray-900 text-base truncate flex-1 min-w-0">
                {selectedUser.name}
              </p>
            </div>

            {/* Zone des messages */}
            <div className="flex-1 bg-gray-50/80 p-3 sm:p-4 overflow-hidden flex flex-col">
              <div className="flex-1 rounded-2xl border border-gray-200 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] overflow-hidden flex flex-col">
                <div className="border-b border-gray-100 bg-gray-50/70 px-4 py-2 text-center shrink-0">
                  <span className="text-[11px] font-medium text-gray-500 bg-white border border-gray-200 px-3 py-1 rounded-full shadow-sm">
                    Début de la conversation avec {selectedUser.name}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-2">
                  {conversationMessages.length === 0 ? (
                    <div className="h-full grid place-items-center text-center px-4">
                      <p className="text-sm text-gray-500">
                        Aucun message pour le moment. Démarrez la conversation.
                      </p>
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
                          className={`text-sm px-3 py-2 max-w-[78%] sm:max-w-[72%] rounded-2xl border shadow-sm ${
                            msg.sender_id === myId
                              ? "text-white bg-purple-600 border-purple-500 rounded-br-md"
                              : "text-gray-800 bg-gray-100 border-gray-200 rounded-bl-md"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Barre de saisie */}
            <div className="bg-white border-t border-gray-200 shrink-0 p-3">
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 focus-within:bg-white shadow-sm">
                <input
                  type="text"
                  placeholder={`Envoyer un message à ${selectedUser.name}…`}
                  className="flex-1 bg-transparent px-1 py-1.5 outline-none text-sm text-gray-800 placeholder-gray-500"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && message.trim()) {
                      sendMessage(myId, selectedUser.id, message);
                      setMessage("");
                    }
                  }}
                />
                <button
                  className="bg-purple-600 hover:bg-purple-700 text-white flex justify-center items-center w-8 h-8 rounded-full shadow-md active:scale-95 shrink-0 transition-all"
                  title="Envoyer"
                  onClick={() => {
                    if (message.trim()) {
                      sendMessage(myId, selectedUser.id, message);
                      setMessage("");
                    }
                  }}
                >
                  <Send size={14} className="translate-x-px" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}