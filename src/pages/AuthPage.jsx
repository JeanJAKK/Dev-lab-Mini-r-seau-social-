
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc"; // icône Google (React Icons)
import { FaFacebook } from "react-icons/fa"; // icône facebook (React Icons)
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./AuthPage.css"; // fichier CSS pour les styles


// Ce composant représente la page d'authentification (comme Facebook)
function AuthPage() {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="auth-container">
      {/* Partie gauche : logo et texte (comme Facebook) */}
      <div className="auth-left">
        <h1 className="logo">Synapselink</h1>
        <p className="subtitle">
          Connecte-toi avec tes amis et découvre le monde autour de toi.
        </p>
      </div>

      {/* Partie droite : formulaire de connexion */}
      <div className="auth-right">
        <form className="login-form">
          <input type="email" placeholder="Adresse e-mail" required />
          <div className="password-field">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Mot de passe"
    required
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
            <label><input type="checkbox" name="remember" id="remember" />Se souvenir de moi</label>
            <a href="">Mot de passe oublié ?</a>
        </div>
        </form>

        <p className="create-account">
          Nouveau sur SocialNet ?  <a href="#">Créer un compte</a>
        </p>
        
      </div>
    </div>
  );
}

export default AuthPage;
