import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus, UserCheck } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import supabase from "../services/supabase";
import { getUser } from "../services/systemeLike/getUser";

export default function SuggestionsCarousel() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [usersName, setUsersName] = useState([]);
  const [followingIds, setFollowingIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const getUsers = async (me) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, avatar_url")
      .order("name", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    const candidates = (data || []).filter((user) => user.id !== me);
    const randomUsers = candidates.sort(() => 0.5 - Math.random()).slice(0, 6);

    setUsersName(randomUsers);
  };

  const loadFollowing = async (me) => {
    if (!me) return;
    const { data, error } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", me);
    if (error) {
      console.error("Erreur récupération follows", error);
      return;
    }
    setFollowingIds((data || []).map((row) => row.following_id));
  };

  const toggleFollow = async (targetId) => {
    const me = await getUser().id;
    if (!me) return;

    if (followingIds.includes(targetId)) {
      const { error } = await supabase
        .from("follows")
        .delete()
        .match({ follower_id: me, following_id: targetId });
      if (!error) {
        setFollowingIds((prev) => prev.filter((id) => id !== targetId));
      }
      return;
    }

    const { error } = await supabase
      .from("follows")
      .insert([{ follower_id: me, following_id: targetId }]);
    if (!error) {
      setFollowingIds((prev) => [...prev, targetId]);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const user = await getUser();
      if (user) {
        await Promise.all([getUsers(user.id), loadFollowing(user.id)]);
      }
      setLoading(false);
    };
    init();
  }, []);

  if (loading || usersName.length === 0) return null;

  return (
    <div className={`my-4 py-4 border-y ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} md:hidden block`}>
      <div className="px-4 mb-3 flex items-center justify-between">
        <h3 className={`font-semibold text-sm ${isDark ? "text-gray-100" : "text-gray-900"}`}>
          Connaissez-vous ces personnes ?
        </h3>
      </div>
      <div className="flex overflow-x-auto gap-3 px-4 pb-2 snap-x snap-mandatory no-scrollbar text-center">
        {usersName.map((user) => (
          <div
            key={user.id}
            className={`snap-center shrink-0 w-[140px] flex flex-col items-center p-3 rounded-xl border ${isDark ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-200"}`}
          >
            <Link to={`/home/profile/${user.id}`} className="block mb-2">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className={`w-16 h-16 rounded-full object-cover mx-auto border-2 ${isDark ? "border-gray-700" : "border-white shadow-sm"}`}
                />
              ) : (
                <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center border-2 ${isDark ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-gray-200 border-white shadow-sm text-gray-600"} font-bold text-xl`}>
                  {user.name?.charAt(0).toUpperCase() ?? "?"}
                </div>
              )}
            </Link>
            <Link to={`/home/profile/${user.id}`} className={`font-medium mb-1 truncate w-full text-sm ${isDark ? "text-gray-200" : "text-gray-800"}`}>
              {user.name?.trim() || "Utilisateur"}
            </Link>
            <p className={`text-xs mb-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Suggestions</p>
            <button
              onClick={() => toggleFollow(user.id)}
              className={`w-full py-1.5 flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition ${
                followingIds.includes(user.id)
                  ? isDark ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-800"
                  : isDark ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
            >
              {followingIds.includes(user.id) ? (
                <>
                  <UserCheck size={14} />
                  Suivi
                </>
              ) : (
                <>
                  <UserPlus size={14} />
                  Suivre
                </>
              )}
            </button>
          </div>
        ))}
      </div>
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}