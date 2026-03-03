import React, { useState } from "react";

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
          JohnDoe123
        </div>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#007aff",
            marginTop: "2px",
          }}
        >
          john.doe@example.com
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
function Reglage({ titre, description, hasToggle, defaultOn = false }) {
  const [active, setActive] = useState(defaultOn);
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
        {hasToggle && (
          <Toggle checked={active} onChange={() => setActive(!active)} />
        )}
      </div>
    </div>
  );
}

// ── Parameter (page principale) ──
export default function Parameter() {
  const [mode, setMode] = useState("dark");

  const reglages = [
    {
      titre: "Thèmes",
      description: "Activer pour mode sombre.",
      hasToggle: true,
      defaultOn: true,
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
    },
  ];

  return (
    <div
      style={{
        fontFamily: "'Nunito', -apple-system, BlinkMacSystemFont, sans-serif",
        background: "#f2f2f7",
        minHeight: "100vh",
        maxWidth: "420px",
        margin: "0 auto",
        paddingBottom: "40px",
      }}
    >
      {/* Switcher Dark / Clair */}
      <div
        style={{
          display: "flex",
          margin: "16px 16px 12px",
          background: "#e5e5ea",
          borderRadius: "12px",
          padding: "3px",
          gap: "3px",
        }}
      >
        {["dark", "light"].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              flex: 1,
              padding: "10px 0",
              border: "none",
              borderRadius: "10px",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "background .2s, color .2s",
              background: mode === m ? "#1c1c1e" : "transparent",
              color: mode === m ? "#ffffff" : "#1c1c1e",
              boxShadow: mode === m ? "0 2px 8px rgba(0,0,0,.18)" : "none",
            }}
          >
            {m === "dark" ? "Dark Mode" : "Mode Clair"}
          </button>
        ))}
      </div>

      {/*  Account Card ici */}
      <AccountCard />

      {/* Réglages */}
      {reglages.map((r) => (
        <Reglage key={r.titre} {...r} />
      ))}
    </div>
  );
}
