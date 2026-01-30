import { useState } from "react";
import { FcGoogle } from "react-icons/fc"; // icône Google (React Icons) 
import { FaFacebook } from "react-icons/fa"; // icône facebook (React Icons)
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import supabase from "../services/supabase.js";
import "./Authpage.css"; // tu peux réutiliser le même CSS que pour l'inscription

function AuthPage({ setAuth }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (!email.includes("@")) {
      setMessage("Email invalide.");
      setLoading(false);
      return;
    }
    if (!password) {
      setMessage("Le mot de passe est requis.");
      setLoading(false);
      return;
    }

    try {
      // 1️ Connexion avec Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage("Email ou mot de passe incorrect !");
        setLoading(false);
        return;
      }

      //  Connexion réussie
      setAuth(true);
      setMessage(" Connexion réussie !");
      setLoading(false);

      // Redirection vers la page d'accueil ou création de post
      navigate("/home");
    } catch (err) {
      console.error(err);
      setMessage("Erreur inattendue. Regarde la console.");
      setLoading(false);
    }
  };

return (
    <div className="auth-container">
      <div className="auth-left">
        <h1 className="logo">SynapseLink</h1>
        <p className="subtitle"> Connecte-toi avec tes amis et découvre le monde autour de toi. </p>
      </div>

      <div className="auth-right">
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            placeholder="Adresse e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>

          {message && (
            <p style={{ color: message.includes("réussie") ? "green" : "red", marginTop: "10px" }}>
              {message}
            </p>
          )}
          <div className="divider">ou</div> 
          {/* Boutons de connexion sociale */} <button type="button" className="google-btn"> 
               <FcGoogle size={22} style={{ marginRight: "8px" }} /> 
               Continuer avec Google </button>
                <button type="button" className="facebook-btn"> 
                    <FaFacebook size={22} style={{ marginRight: "8px" }} /> 
                    Continuer avec Facebook </button> 
                    <div className="remember-forgot">
                          <label> 
                              <input type="checkbox" name="remember" id="remember" /> Se souvenir de moi </label> 
                              <Link to="">Mot de passe oublié ?</Link> </div>
        </form>

        <p className="connect">
          Nouveau sur SynapseLink ?{" "}
          <Link to="/register" className="text-blue-700 hover:text-blue-900">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
