import { Home, Search, Bell, Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { logout } from "../fakeAuth";
import { useNavigate } from "react-router-dom";

export default function NavBar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };
  return (
    <nav className="w-full shadow-md flex h-20 px-4 py-3 justify-between items-center">
      {/* LOGO */}
      <div className="text-xl font-bold text-purple-600">SynapseLink</div>

      {/* LINKS */}
      <ul className="md:flex hidden items-center gap-6 font-medium text-gray-700 absolute md:static top-16 left-0 w-full md:w-auto bg-white md:bg-transparent p-5 md:p-0 shadow-md md:shadow-none transition-all duration-300">
        <li className="flex items-center gap-2 hover:text-purple-600 cursor-pointer">
          <Home size={20} />
          <Link to="acceuil">Accueil</Link>
        </li>

        <li className="flex items-center gap-2 hover:text-purple-600 cursor-pointer">
          <Search size={20} />
          <Link to="search">Rechercher</Link>
        </li>

        <li className="flex items-center gap-2 hover:text-purple-600 cursor-pointer">
          <Bell size={20} />
          <Link to="notifications">Notifications</Link>
        </li>

        <li className="flex items-center gap-2 hover:text-purple-600 cursor-pointer">
          <Mail size={20} />
          <Link to="messages">Messages</Link>
        </li>
        <div>
          <button
            onClick={handleLogout}
            className="text-red-500 p-2 rounded cursor-pointer hidden md:flex"
          >
            <ArrowLeft /> Déconnexion
          </button>
        </div>
      </ul>

      {/* PROFIL */}
      <div className="md:flex items-center gap-2 cursor-pointer">
        <img
          src="backend........."
          alt="profile"
          className="w-9 h-9 rounded-full bg-amber-400 border"
        />
        <span className="text-black"> Profil </span>
      </div>
    </nav>
  );
}
