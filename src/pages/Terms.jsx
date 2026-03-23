// ===============================
// Terms.jsx
// Page des conditions d'utilisation
// ===============================

import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { ArrowLeft, FileText } from "lucide-react";

export default function Terms() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  // Forcer le thème clair au chargement de la page
  React.useEffect(() => {
    if (isDark) {
      toggleTheme();
    }
  }, [isDark, toggleTheme]);

  return (
    <div
      className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"} py-8 flex items-center justify-center`}
    >
      <div
        className={`w-full max-w-4xl mx-auto max-h-[90vh] overflow-hidden ${isDark ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-lg`}
      >
        {/* Header */}
        <div
          className={`p-6 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/register")}
              className={`p-2 rounded-lg transition ${
                isDark
                  ? "hover:bg-gray-700 text-gray-300"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <FileText
                className={isDark ? "text-gray-300" : "text-gray-600"}
                size={24}
              />
              <h1
                className={`text-2xl font-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}
              >
                Conditions d'utilisation
              </h1>
            </div>
          </div>
        </div>

        {/* Content avec scroll */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div
            style={{ lineHeight: "1.6", fontSize: "14px", padding: "0 8px" }}
          >
            <p
              style={{
                marginBottom: "12px",
                color: isDark ? "#e5e5ea" : "#1c1c1e",
              }}
            >
              Bienvenue sur <strong>SynapseLink</strong>, un mini-réseau social
              dédié au partage et à la diffusion des connaissances. En utilisant
              la plateforme, vous acceptez de respecter les règles suivantes :
            </p>

            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                margin: "16px 0 8px 0",
                color: isDark ? "#e5e5ea" : "#1c1c1e",
              }}
            >
              1. Objectif de la plateforme
            </h3>
            <p
              style={{
                marginBottom: "12px",
                color: isDark ? "#a78bfa" : "#007aff",
              }}
            >
              SynapseLink est un espace destiné à l'échange d'idées, de savoirs
              et de ressources éducatives dans un esprit de collaboration et de
              respect mutuel.
            </p>

            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                margin: "16px 0 8px 0",
                color: isDark ? "#e5e5ea" : "#1c1c1e",
              }}
            >
              2. Comportement des utilisateurs
            </h3>
            <p
              style={{
                marginBottom: "12px",
                color: isDark ? "#a78bfa" : "#007aff",
              }}
            >
              Les utilisateurs s'engagent à :
            </p>
            <ul
              style={{
                marginLeft: "20px",
                marginBottom: "12px",
                color: isDark ? "#a78bfa" : "#007aff",
              }}
            >
              <li>publier des contenus respectueux, pertinents et légaux ;</li>
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
                color: isDark ? "#e5e5ea" : "#1c1c1e",
              }}
            >
              3. Contenu partagé
            </h3>
            <p
              style={{
                marginBottom: "12px",
                color: isDark ? "#a78bfa" : "#007aff",
              }}
            >
              Chaque utilisateur reste responsable des contenus qu'il publie.
              Les contenus ne doivent pas violer les droits d'auteur, la vie
              privée ou toute loi en vigueur.
            </p>

            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                margin: "16px 0 8px 0",
                color: isDark ? "#e5e5ea" : "#1c1c1e",
              }}
            >
              4. Modération
            </h3>
            <p
              style={{
                marginBottom: "12px",
                color: isDark ? "#a78bfa" : "#007aff",
              }}
            >
              L'équipe de SynapseLink se réserve le droit de modifier ou
              supprimer tout contenu jugé inapproprié, ainsi que de suspendre ou
              supprimer les comptes qui ne respectent pas ces conditions.
            </p>

            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                margin: "16px 0 8px 0",
                color: isDark ? "#e5e5ea" : "#1c1c1e",
              }}
            >
              5. Protection des données
            </h3>
            <p
              style={{
                marginBottom: "12px",
                color: isDark ? "#a78bfa" : "#007aff",
              }}
            >
              Les informations personnelles sont utilisées uniquement dans le
              cadre du fonctionnement de la plateforme et ne seront pas
              partagées sans consentement, sauf obligation légale.
            </p>

            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                margin: "16px 0 8px 0",
                color: isDark ? "#e5e5ea" : "#1c1c1e",
              }}
            >
              6. Évolution des conditions
            </h3>
            <p
              style={{
                marginBottom: "12px",
                color: isDark ? "#a78bfa" : "#007aff",
              }}
            >
              Ces conditions peuvent être mises à jour afin d'améliorer la
              plateforme. Les utilisateurs seront informés en cas de
              modification importante.
            </p>

            <p
              style={{
                marginTop: "16px",
                fontStyle: "italic",
                color: isDark ? "#a78bfa" : "#007aff",
              }}
            >
              En utilisant SynapseLink, vous contribuez à créer une communauté
              ouverte, collaborative et orientée vers le partage du savoir.
            </p>
          </div>

          <button
            onClick={() => navigate("/register")}
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
          >
            Retour à l'inscription
          </button>
        </div>
      </div>
    </div>
  );
}
