import { useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc"; // icône Google (React Icons)
import { FaFacebook } from "react-icons/fa"; // icône facebook (React Icons)
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import supabase from "../services/supabase.js";
import "../styles/AuthPage.css"; // tu peux réutiliser le même CSS que pour l'inscription

function AuthPage({ setAuth }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState();
  const navigate = useNavigate();

  // useEffect(() => {
  //   //  Vérifie si la session existe
  //   const checkUser = async () => {
  //     const { data } = await supabase.auth.getSession();
  //     setUser(data.session?.user ?? null);
  //   };

  //   checkUser();

  //   //  Écoute les changements de session
  //   const { data: listener } = supabase.auth.onAuthStateChange(
  //     (event, session) => {
  //       setUser(session?.user ?? null);
  //     }
  //   );

  //   return () => {
  //     listener.subscription.unsubscribe();
  //   };
  // }, []);

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      setMessage("Connexion réussie !");
      setAuth(true);
      navigate("/home");
    } catch (err) {
      setMessage("Erreur lors de la connexion.");
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
    <div className="auth-container">
      <div className="auth-left">
        <h1 className="logo">SynapseLink</h1>
        <p className="subtitle">
          {" "}
          Connecte-toi avec tes amis et découvre le monde autour de toi.{" "}
        </p>
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
            <p
              style={{
                color: message.includes("réussie") ? "green" : "red",
                marginTop: "10px",
              }}
            >
              {message}
            </p>
          )}
          <div className="divider">ou</div>
          {/* Boutons de connexion sociale */}{" "}
          <button type="button" className="google-btn" onClick={handleGoogleLogin}>
            <FcGoogle size={22} style={{ marginRight: "8px" }} />
            Continuer avec Google
          </button>
          <button type="button" className="facebook-btn">
            <FaFacebook size={22} style={{ marginRight: "8px" }} />
            Continuer avec Facebook{" "}
          </button>
          <div className="remember-forgot">
            <label>
              <input type="checkbox" name="remember" id="remember" /> Se
              souvenir de moi{" "}
            </label>
            <Link to="">Mot de passe oublié ?</Link>{" "}
          </div>
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
