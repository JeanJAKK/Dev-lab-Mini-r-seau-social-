import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import supabase from "../services/supabase.js";
import "../styles/Register.css";

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSuccess(false);

    if (!name.trim()) {
      setMessage("Le nom est requis.");
      return;
    }
    if (!email.includes("@")) {
      setMessage("Email invalide.");
      return;
    }
    if (password.length < 6) {
      setMessage("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (!acceptTerms) {
      setMessage("Vous devez accepter les conditions d'utilisation.");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Inscription Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name.trim(),
          },
        },
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      // 2️⃣ Création du profil
      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          name: name.trim(),
          email: email,
        });

        if (profileError) {
          console.error("Erreur création profil:", profileError);
        }
      }

      setIsSuccess(true);
      setMessage(
        "Inscription réussie ! Veuillez vérifier votre email pour activer votre compte."
      );
    } catch (err) {
      setMessage("Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  // Connexion avec Google
  const handleGoogleLogin = async () => {
    setMessage("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/home`,
        },
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      // La redirection sera gérée par Supabase
    } catch (err) {
      setMessage("Erreur lors de la connexion Google.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white h-screen w-full">
      <div className="logos">
        <h1 className="logo1">SynapseLink</h1>
      </div>

      <div className="regis">
        <form onSubmit={handleRegister} className="regis-form">
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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

          <div className="policy">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                required
              />
              <span className="checkmark"></span>
              <p>
                J'accepte avoir lu les{" "}
                <Link to="/terms" className="text-blue-700">
                  conditions d'utilisation
                </Link>
              </p>
            </label>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Inscription..." : "S'inscrire"}
          </button>

          {message && (
            <p
              style={{ color: isSuccess ? "green" : "red", marginTop: "10px" }}
            >
              {message}
            </p>
          )}
          <div className="divider">ou</div>
          {/* Boutons de connexion sociale */}
          <button type="button" className="google-btn" onClick={handleGoogleLogin}>
            <FcGoogle size={22} style={{ marginRight: "8px" }} />
            Continuer avec Google
          </button>
          <button type="button" className="facebook-btn">
            <FaFacebook size={22} style={{ marginRight: "8px" }} />
            Continuer avec Facebook
          </button>
        </form>

        <p className="connect">
          Vous avez déjà un compte?{" "}
          <Link to="/authPage" className="text-blue-700 hover:text-blue-900">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
