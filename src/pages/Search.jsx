import React, { useEffect, useState } from "react";
import { Search as SearchIcon, UserPlus } from "lucide-react";
import supabase from "../services/supabase.js";
import { useTheme } from "../context/ThemeContext";
import "../styles/Search.css";

function Search() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  const getUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select(`name`)
      .order("name", { ascending: true });

    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    getUsers();
  }, []);

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
            filteredUsers.map((user) => (
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
                <button className="follow-button">
                  <UserPlus size={14} />
                  Suivre
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
