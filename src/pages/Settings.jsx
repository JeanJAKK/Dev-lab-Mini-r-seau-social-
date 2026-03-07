import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

// ── Toggle de thème global (exemple d'utilisation du contexte) ──
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      style={{
        position: "fixed",
        top: "16px",
        right: "16px",
        padding: "8px 12px",
        borderRadius: "8px",
        border: "none",
        background: theme === "light" ? "#1c1c1e" : "#e5e5ea",
        color: theme === "light" ? "#e5e5ea" : "#1c1c1e",
        cursor: "pointer",
      }}
    >
      {theme === "light" ? "Dark Mode" : "Light Mode"}
    </button>
  );
}

// ── Account Card ──
function AccountCard() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      style={{
        background: isDark ? "#111827" : "#ffffff",
        borderRadius: "16px",
        margin: "16px 16px 12px",
        padding: "14px 18px",
        boxShadow: isDark
          ? "0 1px 4px rgba(255,255,255,.06)"
          : "0 1px 4px rgba(0,0,0,.06)",
        display: "flex",
        alignItems: "center",
        gap: "14px",
      }}
    >
      {/* Avatar + badge + */}
      <div
        style={{
          position: "relative",
          width: "52px",
          height: "52px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #b0b0b8, #6e6e73)",
          }}
        />
        <button
          onClick={() =>
            document.getElementById("profile-picture-input").click()
          }
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            background: "#007aff",
            border: isDark ? "2px solid #2c2c2e" : "2px solid #ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
            fontWeight: 800,
            color: "white",
            lineHeight: 1,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseOver={(e) => {
            e.target.style.background = "#0056cc";
            e.target.style.transform = "scale(1.1)";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "#007aff";
            e.target.style.transform = "scale(1)";
          }}
        >
          +
        </button>
        <input
          id="profile-picture-input"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              // Logique pour traiter l'image
              console.log("Photo de profil sélectionnée:", file);
              // TODO: Implémenter l'upload vers Supabase
            }
          }}
        />
      </div>

      {/* Infos */}
      <div>
        <div
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: isDark ? "#e5e5ea" : "#1c1c1e",
          }}
        >
          <NavLink
            to="/home/profil"
            style={{
              color: isDark ? "#e5e5ea" : "#1c1c1e",
              textDecoration: "none",
            }}
          >
            SophieMartin123
          </NavLink>
        </div>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: isDark ? "#a78bfa" : "#007aff",
            marginTop: "2px",
          }}
        >
          <NavLink
            to="/home/Profil"
            style={{
              color: isDark ? "#a78bfa" : "#007aff",
              textDecoration: "none",
            }}
          >
            sophie.martin@example.com
          </NavLink>
        </div>
      </div>
    </div>
  );
}

// ── Toggle ──
function Toggle({ checked, onChange }) {
  return (
    <div
      onClick={onChange}
      style={{
        position: "relative",
        width: "51px",
        height: "31px",
        flexShrink: 0,
        cursor: "pointer",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "16px",
          background: checked ? "#007aff" : "#e5e5ea",
          transition: "background .25s",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "3px",
          left: "3px",
          width: "25px",
          height: "25px",
          borderRadius: "50%",
          background: "white",
          boxShadow: "0 2px 6px rgba(0,0,0,.22)",
          transition: "transform .25s",
          transform: checked ? "translateX(20px)" : "translateX(0)",
        }}
      />
    </div>
  );
}

// ── Reglage ──
function Reglage({
  titre,
  description,
  hasToggle,
  defaultOn = false,
  hasDropdown = false,
  options = [],
  value,
  onChange,
  toggleState,
  onToggle,
  onClick,
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // if toggleState/onToggle provided, component is controlled by parent
  const [active, setActive] = useState(defaultOn);
  const isControlled =
    toggleState !== undefined && typeof onToggle === "function";
  const current = isControlled ? toggleState : active;
  const handleToggle = () => {
    if (isControlled) {
      onToggle(!toggleState);
    } else {
      setActive(!active);
    }
  };

  return (
    <div
      style={{
        background: isDark ? "#111827" : "#ffffff",
        borderRadius: "16px",
        margin: "0 16px 12px",
        padding: "16px 18px",
        boxShadow: isDark
          ? "0 1px 4px rgba(255,255,255,.06)"
          : "0 1px 4px rgba(0,0,0,.06)",
        cursor: onClick ? "pointer" : "default",
      }}
      onClick={onClick}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: "16px",
              fontWeight: 800,
              color: isDark ? "#ffffff" : "#1c1c1e",
              marginBottom: "4px",
            }}
          >
            {titre}
          </div>
          <div
            style={{
              fontSize: "13.5px",
              fontWeight: 500,
              color: isDark ? "#98989f" : "#6e6e73",
              lineHeight: 1.5,
            }}
          >
            {description}
          </div>
        </div>
        {hasToggle && <Toggle checked={current} onChange={handleToggle} />}
        {hasDropdown && (
          <select
            value={value}
            onChange={onChange}
            style={{
              padding: "6px 10px",
              borderRadius: "8px",
              border: "none",
              background: "transparent",
              color: isDark ? "#ffffff" : "#1c1c1e",
              WebkitAppearance: "none",
              MozAppearance: "none",
            }}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

// ── Parameter (page principale) ──
export default function Parameter() {
  const [language, setLanguage] = useState("fr");
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [showTerms, setShowTerms] = useState(false);

  const containerBg = isDark ? "#111827" : "#eef2f7";
  const containerColor = isDark ? "#f2f2f7" : "#1c1c1e";

  const reglages = [
    {
      titre: "Thèmes",
      description: "Activer pour mode sombre.",
      hasToggle: true,
      toggleState: isDark,
      onToggle: toggleTheme,
    },
    {
      titre: "Notifications",
      description: "Activer les notifications.",
      hasToggle: true,
      defaultOn: true,
    },
    {
      titre: "Confidentialité",
      description: "Gérer les paramètres de confidentialité.",
      hasToggle: false,
    },
    {
      titre: "Langue",
      description: "Choisir la langue de l'application.",
      hasToggle: false,
      hasDropdown: true,
      options: [
        { value: "fr", label: "Français" },
        { value: "en", label: "English" },
      ],
      value: language,
      onChange: (e) => setLanguage(e.target.value),
    },
    {
      titre: "Conditions d'utilisation",
      description: "Consulter les conditions d'utilisation.",
      hasToggle: false,
      onClick: () => setShowTerms(true),
    },
  ];

  return (
    <div
      style={{
        fontFamily: "'Nunito', -apple-system, BlinkMacSystemFont, sans-serif",
        background: containerBg,
        color: containerColor,
        minHeight: "100vh",
        maxWidth: "420px",
        margin: "0 auto",
        paddingTop: "40px",
        paddingBottom: "40px",
      }}
    >
      {/*  Account Card ici */}
      <AccountCard />

      {/* Réglages */}
      {reglages.map((r) => (
        <Reglage key={r.titre} {...r} />
      ))}

      {/* Modal Conditions d'utilisation */}
      {showTerms && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={() => setShowTerms(false)}
        >
          <div
            style={{
              background: isDark ? "#1f2937" : "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "500px",
              width: "100%",
              maxHeight: "80vh",
              overflow: "auto",
              color: isDark ? "#e5e5ea" : "#1c1c1e",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "700",
                marginBottom: "16px",
                color: isDark ? "#e5e5ea" : "#1c1c1e",
              }}
            >
              Conditions d'utilisation – SynapseLink
            </h2>

            <div style={{ lineHeight: "1.6", fontSize: "14px" }}>
              <p style={{ marginBottom: "12px" }}>
                Bienvenue sur <strong>SynapseLink</strong>, un mini-réseau
                social dédié au partage et à la diffusion des connaissances. En
                utilisant la plateforme, vous acceptez de respecter les règles
                suivantes :
              </p>

              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  margin: "16px 0 8px 0",
                }}
              >
                1. Objectif de la plateforme
              </h3>
              <p style={{ marginBottom: "12px" }}>
                SynapseLink est un espace destiné à l'échange d'idées, de
                savoirs et de ressources éducatives dans un esprit de
                collaboration et de respect mutuel.
              </p>

              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  margin: "16px 0 8px 0",
                }}
              >
                2. Comportement des utilisateurs
              </h3>
              <p style={{ marginBottom: "12px" }}>
                Les utilisateurs s'engagent à :
              </p>
              <ul style={{ marginLeft: "20px", marginBottom: "12px" }}>
                <li>
                  publier des contenus respectueux, pertinents et légaux ;
                </li>
                <li>
                  éviter toute forme de harcèlement, de discrimination ou de
                  désinformation ;
                </li>
                <li>
                  respecter les autres membres et encourager des échanges
                  constructifs.
                </li>
              </ul>

              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  margin: "16px 0 8px 0",
                }}
              >
                3. Contenu partagé
              </h3>
              <p style={{ marginBottom: "12px" }}>
                Chaque utilisateur reste responsable des contenus qu'il publie.
                Les contenus ne doivent pas violer les droits d'auteur, la vie
                privée ou toute loi en vigueur.
              </p>

              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  margin: "16px 0 8px 0",
                }}
              >
                4. Modération
              </h3>
              <p style={{ marginBottom: "12px" }}>
                L'équipe de SynapseLink se réserve le droit de modifier ou
                supprimer tout contenu jugé inapproprié, ainsi que de suspendre
                ou supprimer les comptes qui ne respectent pas ces conditions.
              </p>

              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  margin: "16px 0 8px 0",
                }}
              >
                5. Protection des données
              </h3>
              <p style={{ marginBottom: "12px" }}>
                Les informations personnelles sont utilisées uniquement dans le
                cadre du fonctionnement de la plateforme et ne seront pas
                partagées sans consentement, sauf obligation légale.
              </p>

              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  margin: "16px 0 8px 0",
                }}
              >
                6. Évolution des conditions
              </h3>
              <p style={{ marginBottom: "12px" }}>
                Ces conditions peuvent être mises à jour afin d'améliorer la
                plateforme. Les utilisateurs seront informés en cas de
                modification importante.
              </p>

              <p style={{ marginTop: "16px", fontStyle: "italic" }}>
                En utilisant SynapseLink, vous contribuez à créer une communauté
                ouverte, collaborative et orientée vers le partage du savoir.
              </p>
            </div>

            <button
              style={{
                marginTop: "20px",
                padding: "12px 24px",
                background: isDark ? "#805ad5" : "#7c3aed",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                width: "100%",
              }}
              onClick={() => setShowTerms(false)}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
