import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { supabase } from "../supabaseClient";
import "../styles/Suggestions.css";

function Suggestions() {
  const { theme } = useTheme();

  const [usersName, setUsersName] = useState([]);

  const getUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, avatar_url")
      .order("name", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    const randomUsers = data.sort(() => 0.5 - Math.random()).slice(0, 4);

    setUsersName(randomUsers);
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div className="suggestions-page" data-theme={theme}>
      <div className="suggestions-container">
        <h3 className="suggestions-title">Suggestions</h3>

        <div className="suggestions-list">
          {usersName.map((user, index) => (
            <div key={index} className="suggestion-item">
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

              {/* Follow Button */}
              <button className="follow-button">
                <UserPlus size={14} />
                Suivre
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Suggestions;
