import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import supabase from "../services/supabase.js";
import "./Register.css";

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 🔴 MODIFIÉ ICI UNIQUEMENT
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

    setLoading(true);

    try {
      // 1️⃣ Inscription Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      const user = data.user;
      if (!user) {
        setMessage("Inscription réussie, vérifie ton email.");
        setIsSuccess(true);
        setLoading(false);
        return;
      }


      setIsSuccess(true);
      setMessage("✅ Inscription réussie !");
      setLoading(false);

      setTimeout(() => {
        navigate("/authPage");
      }, 1200);
    } catch (err) {
      console.error(err);
      setMessage("Erreur inattendue.");
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
            <p>
              En cliquant sur "S'inscrire", vous acceptez nos{" "}
              <span className="text-blue-700">Conditions d'utilisation</span>, notre{" "}
              <span className="text-blue-700">Politique de confidentialité</span> et notre{" "}
              <span className="text-blue-700">Politique relatives aux cookies</span>.
            </p>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Inscription..." : "S'inscrire"}
          </button>

          {message && (
            <p style={{ color: isSuccess ? "green" : "red", marginTop: "10px" }}>
              {message}
            </p>
          )}
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
