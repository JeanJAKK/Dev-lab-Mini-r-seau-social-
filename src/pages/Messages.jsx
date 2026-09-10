import React, { useEffect, useRef, useState } from "react";
import { Send, ArrowLeft, MessageSquare } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import supabase from "../services/supabase.js";
import { getUser } from "../services/systemeLike/getUser.js";
import { useMessages } from "../hooks/useMessages.js";
import { useTheme } from "../context/ThemeContext";

export default function Messages() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sendError, setSendError] = useState("");
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getUser,
  });

  const {
    messages: conversationMessages,
    loading: messagesLoading,
    sending: messageSending,
    envoyerMessage,
  } = useMessages(currentUser?.id, selectedUser?.id);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [conversationMessages, selectedUser?.id]);

  const fetchFollowedUsers = async (currentUserId, offset = 0, limit = 20) => {
    if (!currentUserId) return [];

    const { data: followsData, error: followsError } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", currentUserId);

    if (followsError) {
      console.error("Erreur chargement abonnements:", followsError);
      return [];
    }

    const followingIds = followsData.map((f) => f.following_id);

    if (followingIds.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from("profiles")
      .select(`id, name, avatar_url`)
      .in("id", followingIds)
      .order("name", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Erreur chargement profils:", error);
      return [];
    }

    return data;
  };

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["followedUsers", currentUser?.id],
    queryFn: () => fetchFollowedUsers(currentUser?.id, 0, 20),
    enabled: !!currentUser?.id,
  });

  const loadMoreUsers = async () => {
    if (loadingMore || !hasMore || !currentUser?.id) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const newUsers = await fetchFollowedUsers(currentUser.id, nextPage * 20, 20);
    queryClient.setQueryData(["followedUsers", currentUser.id], (old) => [...old, ...newUsers]);
    setPage(nextPage);
    setHasMore(newUsers.length === 20);
    setLoadingMore(false);
  };

  const handleSend = async () => {
    if (!message.trim() || !selectedUser) return;

    const texte = message.trim();
    setMessage("");
    setSendError("");

    try {
      await envoyerMessage(texte);
    } catch {
      setMessage(texte);
      setSendError("Le message n'a pas pu être envoyé. Réessayez.");
    }
  };

  return (
    <div
      className={`flex w-full max-w-5xl mx-auto overflow-hidden ${
        selectedUser
          ? `fixed inset-x-0 top-2 bottom-2 z-60 min-h-0 shadow-[0_0_0_100vmax_${isDark ? "#111827" : "#f8fafc"}] md:static md:h-[calc(100dvh-110px)] md:min-h-0 md:my-4 md:rounded-xl md:border ${isDark ? "md:border-gray-700" : "md:border-slate-200"} md:shadow-none`
          : "h-[calc(100dvh-128px)] min-h-[420px] sm:h-[calc(100dvh-110px)] sm:my-4"
      } ${isDark ? "bg-gray-900 text-gray-100 sm:border-gray-700" : "bg-slate-50 text-slate-900 sm:border-slate-200"} sm:rounded-xl`}
    >
      <div
        className={`
          flex flex-col shrink-0 border-r ${isDark ? "border-gray-700 bg-gray-900" : "border-slate-200 bg-slate-50"}
          transition-all duration-300
          ${
            selectedUser
              ? "hidden sm:flex sm:w-[280px] lg:w-[340px]"
              : "flex w-full sm:w-[280px] lg:w-[340px]"
          }
        `}
      >
        <div
          className={`px-5 border-b flex items-center h-[68px] ${isDark ? "border-gray-700 bg-gray-900" : "border-slate-200 bg-slate-50"}`}
        >
          <h2
            className={`text-lg font-bold ${isDark ? "text-gray-100" : "text-slate-800"}`}
          >
            Messages
          </h2>
        </div>

        <div className="overflow-y-auto flex-1 p-3 space-y-1">
          {isLoading ? (
            [1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 animate-pulse"
              >
                <div className="w-10 h-10 bg-gray-300 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-300 rounded w-1/2" />
                  <div className="h-2 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            ))
          ) : users.length === 0 ? (
            <div className="p-6 text-center">
              <p
                className={`text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}
              >
                Vous ne suivez personne pour le moment.
              </p>
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border border-transparent ${
                  selectedUser?.id === user.id
                    ? isDark
                      ? "bg-purple-950/40 border-purple-900/60"
                      : "bg-purple-50 border-purple-100"
                    : isDark
                      ? "hover:bg-gray-800"
                      : "hover:bg-slate-100"
                }`}
              >
                <div className="relative shrink-0">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className={`w-10 h-10 rounded-full object-cover border ${isDark ? "border-slate-700" : "border-gray-200"}`}
                    />
                  ) : (
                    <div
                      className={`w-10 h-10 flex justify-center items-center font-bold rounded-full border text-base ${isDark ? "bg-purple-950/60 text-purple-200 border-slate-700" : "bg-purple-100 text-purple-700 border-gray-200"}`}
                    >
                      {user.name?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-semibold text-sm truncate ${isDark ? "text-slate-100" : "text-gray-900"}`}
                  >
                    {user.name}
                  </p>
                  {selectedUser?.id !== user.id || conversationMessages.length === 0 ? (
                    <p
                      className={`text-xs truncate ${
                        selectedUser?.id === user.id
                          ? isDark
                            ? "text-purple-300"
                            : "text-purple-600"
                          : isDark
                            ? "text-slate-400"
                            : "text-gray-500"
                      }`}
                    >
                      Appuyez pour écrire…
                    </p>
                  ) : null}
                </div>
              </div>
            ))
          )}
          {hasMore && users.length > 0 && (
            <button
              onClick={loadMoreUsers}
              disabled={loadingMore}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "10px",
                borderRadius: "6px",
                backgroundColor: "transparent",
                color: isDark ? "#c4b5fd" : "#6d28d9",
                border: isDark ? "1px solid #4b5563" : "1px solid #ddd6fe",
                cursor: loadingMore ? "not-allowed" : "pointer",
                opacity: loadingMore ? 0.7 : 1,
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              {loadingMore ? "Chargement..." : "Charger plus"}
            </button>
          )}
        </div>
      </div>

      <div
        className={`
          flex flex-col min-w-0 min-h-0 ${isDark ? "bg-gray-900" : "bg-slate-50"}
          sm:flex sm:flex-1
          ${selectedUser ? "flex flex-1" : "hidden"}
        `}
      >
        {!selectedUser ? (
          <div
            className={`flex-1 flex flex-col justify-center items-center p-6 ${isDark ? "bg-gray-900" : "bg-slate-50"}`}
          >
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-inner ${isDark ? "bg-purple-950/60 text-purple-300" : "bg-purple-100 text-purple-600"}`}
            >
              <MessageSquare size={32} className="opacity-80" />
            </div>
            <h3
              className={`text-xl font-bold mb-2 ${isDark ? "text-slate-200" : "text-gray-700"}`}
            >
              Vos messages
            </h3>
            <p
              className={`text-sm max-w-sm text-center ${isDark ? "text-slate-400" : "text-gray-500"}`}
            >
              Sélectionnez un contact dans la liste à gauche pour démarrer une
              conversation en privé.
            </p>
          </div>
        ) : (
          <>
            <div
              className={`h-[68px] border-b flex items-center gap-3 px-4 sm:px-7 shrink-0 ${isDark ? "border-gray-700 bg-gray-900" : "border-slate-200 bg-slate-50"}`}
            >
              <button
                onClick={() => setSelectedUser(null)}
                className={`sm:hidden p-2 -ml-2 rounded-full transition ${isDark ? "text-slate-300 hover:bg-slate-800" : "text-gray-500 hover:bg-gray-100"}`}
              >
                <ArrowLeft size={20} />
              </button>

              <div className="relative shrink-0">
                {selectedUser.avatar_url ? (
                  <img
                    src={selectedUser.avatar_url}
                    alt={selectedUser.name}
                    className={`w-10 h-10 rounded-full object-cover border ${isDark ? "border-gray-600" : "border-slate-200"}`}
                  />
                ) : (
                  <div className={`w-10 h-10 flex justify-center items-center font-bold rounded-full border text-sm ${isDark ? "bg-purple-950/60 text-purple-200 border-gray-600" : "bg-purple-100 text-purple-700 border-purple-100"}`}>
                    {selectedUser.name?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                )}
              </div>

              <p
                className={`font-bold text-base truncate flex-1 min-w-0 ${isDark ? "text-slate-100" : "text-gray-900"}`}
              >
                {selectedUser.name}
              </p>
            </div>

            <div
              className={`flex-1 min-h-0 p-2 md:p-0 overflow-hidden flex flex-col ${isDark ? "bg-gray-800/70" : "bg-slate-100/80"}`}
            >
              <div
                className={`flex-1 overflow-hidden flex flex-col ${isDark ? "bg-gray-900" : "bg-slate-50"}`}
              >
                <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 sm:px-4 py-4 space-y-2">
                  <p
                    className={`text-center text-[11px] font-medium pb-2 ${isDark ? "text-gray-400" : "text-slate-500"}`}
                  >
                    Début de la conversation avec {selectedUser.name}
                  </p>
                  {messagesLoading ? (
                    <div className="h-full grid place-items-center text-center px-4">
                      <p className="text-sm text-gray-500">Chargement…</p>
                    </div>
                  ) : conversationMessages.length === 0 ? (
                    <div className="h-full grid place-items-center text-center px-4">
                      <p className="text-sm text-gray-500">
                        Aucun message pour le moment. Démarrez la conversation.
                      </p>
                    </div>
                  ) : (
                    conversationMessages.map((msg) => (
                      <div
                        key={msg.idmessage ?? msg.id ?? `${msg.sender_id}-${msg.created_at}`}
                        className={`flex ${
                          msg.sender_id === currentUser?.id
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`text-sm leading-5 wrap-break-word whitespace-pre-wrap px-3 py-2 max-w-[88%] sm:max-w-[72%] rounded-2xl shadow-sm ${
                            msg.sender_id === currentUser?.id
                              ? "text-white bg-linear-to-r from-purple-600 to-indigo-500 rounded-br-md"
                              : isDark
                                ? "text-gray-100 bg-gray-800 rounded-bl-md"
                                : "text-slate-800 bg-white rounded-bl-md"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} aria-hidden="true" />
                </div>
              </div>
            </div>

            <div
              className={`shrink-0 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:p-3 border-t ${isDark ? "bg-gray-900 border-gray-700" : "bg-slate-50 border-slate-200"}`}
            >
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm transition ${isDark ? "bg-gray-800 border-gray-700 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20" : "bg-white border-slate-200 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100"}`}
              >
                <input
                  type="text"
                  placeholder={`Envoyer un message à ${selectedUser.name}…`}
                  disabled={messageSending}
                  className={`flex-1 min-w-0 bg-transparent px-1 py-1.5 outline-none text-sm ${isDark ? "text-slate-100 placeholder-slate-400" : "text-gray-800 placeholder-gray-500"}`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && message.trim() && !messageSending) {
                      handleSend();
                    }
                  }}
                />
                <button
                  disabled={messageSending || !message.trim()}
                  className="bg-linear-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 text-white flex justify-center items-center w-8 h-8 rounded-full shadow-md active:scale-95 shrink-0 transition-all"
                  title="Envoyer"
                  onClick={handleSend}
                >
                  <Send size={14} />
                </button>
              </div>
              {sendError && <p className="mt-2 text-center text-xs text-red-500">{sendError}</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}