import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc"; // icône Google (React Icons)
import { FaFacebook } from "react-icons/fa"; // icône facebook (React Icons)
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./AuthPage.css"; // fichier CSS pour les styles
import { Link } from "react-router-dom";
import { fakeLogin } from "../fakeAuth";
import { useNavigate } from "react-router-dom";


function AuthPage({ setAuth }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();


  const handleLogin = (e) => {
    e.preventDefault();

    const success = fakeLogin(email, password);

    if (success) {
      setAuth(true);
       navigate("/create-post");
    } else {
      setError("Email ou mot de passe incorrect !");
      
    }
  };

  return (
    <div className="auth-container">
      {/* Partie gauche : logo et texte (comme Facebook) */}
      <div className="auth-left">
        <h1 className="logo">SynapseLink</h1>
        <p className="subtitle">
          Connecte-toi avec tes amis et découvre le monde autour de toi.
        </p>
      </div>

      {/* Partie droite : formulaire de connexion */}
      <div className="auth-right">
        <form className="login-form" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Adresse e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button type="submit" className="login-btn">
            Se connecter
          </button>
          {error && <p className="text-red-600 mt-2">{error}</p>}

          <div className="divider">ou</div>

          {/* Boutons de connexion sociale */}
          <button type="button" className="google-btn">
            <FcGoogle size={22} style={{ marginRight: "8px" }} />
            Continuer avec Google
          </button>

          <button type="button" className="facebook-btn">
            <FaFacebook size={22} style={{ marginRight: "8px" }} />
            Continuer avec Facebook
          </button>
          <div className="remember-forgot">
            <label>
              <input type="checkbox" name="remember" id="remember" />
              Se souvenir de moi
            </label>
            <Link to="">Mot de passe oublié ?</Link>
          </div>
        </form>

        <p className="create-account">
          Nouveau sur SynapseLink ? <Link to="/Register">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
