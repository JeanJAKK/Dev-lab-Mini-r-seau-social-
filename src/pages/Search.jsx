import React, { useEffect, useState } from "react";
import { Search as SearchIcon, UserPlus } from "lucide-react";
import supabase from "../services/supabase.js";
import { useTheme } from "../context/ThemeContext";
import { getUser } from "../services/systemeLike/getUser.js";
import "../styles/Search.css";

function Search() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState([]);
  const [myId, setMyId] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { theme } = useTheme();

  const getUsers = async (offset = 0, limit = 20) => {
    if (offset === 0) setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select(`id, name, avatar_url`)
      .order("name", { ascending: true })
      .range(offset, offset + limit - 1);

    if (!error && data) {
      if (offset === 0) {
        setUsers(data);
      } else {
        setUsers((prev) => [...prev, ...data]);
      }
      setHasMore(data.length === limit);
    }
    if (offset === 0) setLoading(false);
    else setLoadingMore(false);
  };

  useEffect(() => {
    const init = async () => {
      const user = await getUser();
      if (user && user.id) {
        setMyId(user.id);
        loadFollowing(user.id);
      }
      setPage(0);
      getUsers(0, 20);
    };
    init();
  }, []);

  const loadMoreUsers = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    await getUsers(nextPage * 20, 20);
    setPage(nextPage);
  };

  const loadFollowing = async (userId) => {  
    const { data, error } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", userId);
    if (error) {
      console.error("Erreur récupération follows", error);
      return;
    }
    setFollowingIds(data.map((row) => row.following_id));
  };

  const toggleFollow = async (targetId) => {
    if (followingIds.includes(targetId)) {
      // unfollow
      const { error } = await supabase
        .from("follows")
        .delete()
        .match({ follower_id: myId, following_id: targetId });
      if (!error) {
        setFollowingIds((prev) => prev.filter((id) => id !== targetId));
      } else {
        console.error("Erreur unfollow", error);
      }
    } else {
      // follow
      const { error } = await supabase
        .from("follows")
        .insert([{ follower_id: myId, following_id: targetId }]);
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
          
          {hasMore && filteredUsers.length > 0 && (
            <button
              onClick={loadMoreUsers}
              disabled={loadingMore}
              className="load-more-btn"
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "20px",
                borderRadius: "8px",
                backgroundColor: theme === "dark" ? "#374151" : "#e5e7eb",
                color: theme === "dark" ? "#f3f4f6" : "#1f2937",
                border: "none",
                cursor: loadingMore ? "not-allowed" : "pointer",
                opacity: loadingMore ? 0.7 : 1,
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              {loadingMore ? "Chargement..." : "Charger plus d'utilisateurs"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Search;
