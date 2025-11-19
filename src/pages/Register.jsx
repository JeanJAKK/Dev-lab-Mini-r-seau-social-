import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Register.css";
function Register() {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <>
      <div className="bg-white h-screen w-full">
        <div className="logos">
          <h1 className="logo1">SynapseLink</h1>
        </div>
        <div className="regis">
          <form action="" className="regis-form">
            <input type="text" placeholder="Nomd'utilisateur" />
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
