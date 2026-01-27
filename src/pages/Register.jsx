import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import supabase from "../services/supabase.js";
import "./Register.css";

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSuccess(false);

    // validations simples côté client
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

    try {
      setLoading(true);

      // 1) Créer le compte dans Supabase Auth
      const { data: signData, error: signError } = await supabase.auth.signUp({
        email,
        password,
        options: {
    data: {
      name: name.trim()
    }
  }
      });

      if (signError) {
        setMessage("Erreur inscription : " + signError.message);
        setIsSuccess(false);
        setLoading(false);
        return;
      }

      // signData.user contient l'utilisateur créé (ou null selon config)
      const userId = signData?.user?.id;
      if (!userId) {
        // cas improbable, mais on gère
        setMessage("Impossible de récupérer l'id utilisateur après inscription.");
        setIsSuccess(false);
        setLoading(false);
        return;
      }

      // 2) Insérer le profil dans la table 'profiles'
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([{ id: userId, name: name.trim(), email }]);

      if (profileError) {
        // si insertion du profil échoue, on peut décider de supprimer l'utilisateur ou informer
        setMessage("Erreur création profil : " + profileError.message);
        setIsSuccess(false);
        setLoading(false);
        return;
      }

      // succès
      setIsSuccess(true);
      setMessage("✅ Inscription réussie ! Vérifie ton email si confirmation requise.");
      setLoading(false);

      // option : rediriger vers la page de connexion après 1.5s
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error(err);
      setMessage("Erreur inattendue. Regarde la console.");
      setIsSuccess(false);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white h-screen w-full">
        <div className="logos">
          <h1 className="logo1">SynapseLink</h1>
        </div>
        <div className="regis">
          <form onSubmit={handleRegister} className="regis-form">
            <input type="text" placeholder="Nomd'utilisateur" />
            <input type="email" placeholder="Adresse e-mail"  value={email}
                onChange={(e) => setEmail(e.target.value)}  required />
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
                En cliquant sur "S'inscrire", vous acceptez nos <span className="text-blue-700">Conditions
                d'utilisation</span>, notre <span className="text-blue-700">Politique de confidentialité</span> et notre
                <span className="text-blue-700">Politique relatives aux cookies</span>. Vous pourrez recevoir des
                notifications par SMS de notre part et vous désabonner à tout
                moment.
              </p>
            </div>
            <button type="submit" className="login-btn">
              S'inscrire
            </button>
          </form>
          <p className="connect">
            Vous avez déjà un compte?{" "}
            <Link to="/Authpage"className="text-blue-700 hover:text-blue-900 ">
              Se connecter
            </Link>{" "}
          </p>
        </div>
      </div>
      <div></div>
    </>
  );
}

export default Register;
