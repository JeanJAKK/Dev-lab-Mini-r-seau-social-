import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import supabase from "../services/supabase";
import { getUserId } from "../services/systemeLike/getUserId";
import "../styles/Suggestions.css";

function Suggestions() {
  const { theme } = useTheme();

  const [usersName, setUsersName] = useState([]);
  const [followingIds, setFollowingIds] = useState([]);
  const [myId, setMyId] = useState(null);

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
    const randomUsers = candidates.sort(() => 0.5 - Math.random()).slice(0, 4);

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
    const me = await getUserId();
    if (!me) return;

    if (followingIds.includes(targetId)) {
      const { error } = await supabase
        .from("follows")
        .delete()
        .match({ follower_id: me, following_id: targetId });
      if (!error) {
        setFollowingIds((prev) => prev.filter((id) => id !== targetId));
      } else {
        console.error("Erreur unfollow", error);
      }
      return;
    }

    const { error } = await supabase
      .from("follows")
      .insert([{ follower_id: me, following_id: targetId }]);
    if (!error) {
      setFollowingIds((prev) => [...prev, targetId]);
    } else {
      console.error("Erreur follow", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      const me = await getUserId();
      setMyId(me);
      await Promise.all([getUsers(me), loadFollowing(me)]);
    };
    init();
  }, []);

  return (
    <div className="suggestions-page" data-theme={theme}>
      <div className="suggestions-container">
        <h3 className="suggestions-title">Suggestions</h3>

        <div className="suggestions-list">
          {usersName
            .filter((user) => user.id !== myId)
            .map((user) => (
            <div key={user.id} className="suggestion-item">
              {/* Avatar + Info cliquables → profil */}
              <Link to={`/home/profile/${user.id}`} className="user-avatar" style={{ textDecoration: "none" }}>
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="avatar-img"
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {user.name?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                )}
              </Link>

              {/* Info */}
              <Link to={`/home/profile/${user.id}`} className="user-info" style={{ textDecoration: "none" }}>
                <p className="user-name">{user.name?.trim()}</p>
              </Link>

              {/* Bouton suivre */}
              <button
                className={`follow-button ${followingIds.includes(user.id) ? "following" : ""}`}
                onClick={() => toggleFollow(user.id)}
              >
                <UserPlus size={14} />
                {followingIds.includes(user.id) ? "Suivi" : "Suivre"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Suggestions;
