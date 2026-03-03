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
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "16px",
        margin: "16px 16px 12px",
        padding: "14px 18px",
        boxShadow: "0 1px 4px rgba(0,0,0,.06)",
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
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            background: "#007aff",
            border: "2px solid #ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
            fontWeight: 800,
            color: "white",
            lineHeight: 1,
          }}
        >
          +
        </div>
      </div>

      {/* Infos */}
      <div>
        <div style={{ fontSize: "16px", fontWeight: 700, color: "#1c1c1e" }}>
          <NavLink
            to="/home/profil"
            style={{ color: "#1c1c1e", textDecoration: "none" }}
          >
            JohnDoe123
          </NavLink>
        </div>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#007aff",
            marginTop: "2px",
          }}
        >
          <NavLink
            to="/home/Profil"
            style={{ color: "#007aff", textDecoration: "none" }}
          >
            john.doe@example.com
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
}) {
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
        background: "#ffffff",
        borderRadius: "16px",
        margin: "0 16px 12px",
        padding: "16px 18px",
        boxShadow: "0 1px 4px rgba(0,0,0,.06)",
      }}
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
              color: "#1c1c1e",
              marginBottom: "4px",
            }}
          >
            {titre}
          </div>
          <div
            style={{
              fontSize: "13.5px",
              fontWeight: 500,
              color: "#6e6e73",
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
              color: "#1c1c1e",
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
  const [darkMode, setDarkMode] = useState(false);

  const containerBg = darkMode ? "#1c1c1e" : "#eef2f7";
  const containerColor = darkMode ? "#f2f2f7" : "#1c1c1e";

  const reglages = [
    {
      titre: "Thèmes",
      description: "Activer pour mode sombre.",
      hasToggle: true,
      toggleState: darkMode,
      onToggle: () => setDarkMode(!darkMode),
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
        marginTop: "100px",
        paddingBottom: "40px",
      }}
    >
      {/*  Account Card ici */}
      <AccountCard />

      {/* Réglages */}
      {reglages.map((r) => (
        <Reglage key={r.titre} {...r} />
      ))}
    </div>
  );
}
