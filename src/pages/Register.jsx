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
          <h1 className="logo1">Synapselink</h1>
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
                En cliquant sur S'inscrire, vous acceptez nos Conditions
                d'utilisation, notre Politique de confidentialité et notre
                Politique relativea aux cookies. Vous pourrez recevoir des
                notifications par SMS de notre part et vous désabonner à tout
                moment.
              </p>
            </div>
            <button type="submit" className="login-btn">
              S'inscrire
            </button>
          </form>
          <p>
            retour{" "}
            <Link to="/Authpage" className="text-blue-700 hover:text-blue-400">
              retour
            </Link>{" "}
          </p>
        </div>
      </div>
      <div></div>
    </>
  );
}
export default Register;
