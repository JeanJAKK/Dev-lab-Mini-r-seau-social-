import React, { useEffect, useState } from "react";
import { Search as SearchIcon, UserPlus } from "lucide-react";
import supabase from "../services/supabase.js";
import { useTheme } from "../context/ThemeContext";
import { getUserId } from "../services/systemeLike/getUserId.js";
import "../styles/Search.css";

function Search() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState([]);
  const [myId, setMyId] = useState(null);
  const { theme } = useTheme();

  const getUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select(`id, name, avatar_url`)
      .order("name", { ascending: true });

    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    getUsers();
    loadFollowing();
  }, []);

  const loadFollowing = async () => {
    const me = await getUserId();
    if (!me) return;
    setMyId(me);
    const { data, error } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", me);
    if (error) {
      console.error("Erreur récupération follows", error);
      return;
    }
    setFollowingIds(data.map((row) => row.following_id));
  };

  const toggleFollow = async (targetId) => {
    const me = await getUserId();
    if (!me) return;
    if (followingIds.includes(targetId)) {
      // unfollow
      const { error } = await supabase
        .from("follows")
        .delete()
        .match({ follower_id: me, following_id: targetId });
      if (!error) {
        setFollowingIds((prev) => prev.filter((id) => id !== targetId));
      } else {
        console.error("Erreur unfollow", error);
      }
    } else {
      // follow
      const { error } = await supabase
        .from("follows")
        .insert([{ follower_id: me, following_id: targetId }]);
      if (!error) {
        setFollowingIds((prev) => [...prev, targetId]);
      } else {
        console.error("Erreur follow", error);
      }
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(query.toLowerCase()) ||
      user.username?.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="search-page" data-theme={theme}>
      <div className="search-container">
        {/* Search Bar */}
        <div className="search-bar-wrapper">
          <SearchIcon size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher des personnes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Tab: Utilisateurs only */}
        <div className="search-tabs">
          <button className="tab-button active">Utilisateurs</button>
        </div>

        {/* Users List */}
        <div className="users-list">
          {loading ? (
            // Skeleton loaders
            [1, 2, 3].map((i) => (
              <div key={i} className="user-item skeleton">
                <div className="user-avatar skeleton-avatar" />
                <div className="user-info skeleton-info">
                  <div className="skeleton-line" />
                  <div className="skeleton-line short" />
                </div>
                <div className="follow-button skeleton-button" />
              </div>
            ))
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state">Aucun utilisateur trouvé</div>
          ) : (
            filteredUsers
              .filter((u) => u.id !== myId)
              .map((user) => (
                <div key={user.id} className="user-item">
                  {/* Avatar */}
                  <div className="user-avatar">
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
                  </div>

                  {/* Info */}
                  <div className="user-info">
                    <p className="user-name">{user.name}</p>
                  </div>

                  {/* Follow Button */}
                  <button
                    className={`follow-button ${followingIds.includes(user.id) ? "following" : ""}`}
                    onClick={() => toggleFollow(user.id)}
                  >
                    <UserPlus size={14} />
                    {followingIds.includes(user.id) ? "Suivi" : "Suivre"}
                  </button>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Search;
