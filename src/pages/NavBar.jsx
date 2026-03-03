import { useState, useRef, useEffect } from "react";
import { Home, Search, Bell, Mail, ArrowLeft, User, Plus, Settings, ChevronDown, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../fakeAuth";

export default function NavBar() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ Mock user frontend-only
  const [user] = useState({
    full_name: "Sophie Martin",
    email: "sophie.martin@example.com",
    avatar_url: "https://i.pravatar.cc/300"
  });

  const displayName = user.full_name;
  const avatarUrl = user.avatar_url || `https://ui-avatars.com/api/?name=${displayName}&background=random`;

  // Fermer le dropdown si clic en dehors
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/authPage", { replace: true });
  };

  const activeClass = "text-purple-600 font-bold";
  const normalClass = "text-gray-600 hover:text-purple-600 transition";

  return (
    <>
      {/* NAVBAR DESKTOP */}
      <nav className="w-full h-20 md:h-17 items-center bg-white border-b fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-full">

            {/* LOGO */}
            <p className="text-2xl md:w-42 text-center font-bold text-purple-600">
              SynapseLink
            </p>

            {/* LINKS */}
            <ul className="hidden md:flex text-lg items-center gap-8 font-medium">
              <li>
                <NavLink to="." end className={({ isActive }) => `flex items-center gap-2 ${isActive ? activeClass : normalClass}`}>
                  <Home size={18} /> Accueil
                </NavLink>
              </li>
              <li>
                <NavLink to="search" className={({ isActive }) => `flex items-center gap-2 ${isActive ? activeClass : normalClass}`}>
                  <Search size={18} /> Rechercher
                </NavLink>
              </li>
              <li>
                <NavLink to="notifications" className={({ isActive }) => `flex items-center gap-2 ${isActive ? activeClass : normalClass}`}>
                  <Bell size={18} /> Notifications
                </NavLink>
              </li>
              <li>
                <NavLink to="messages" className={({ isActive }) => `flex items-center gap-2 ${isActive ? activeClass : normalClass}`}>
                  <Mail size={18} /> Messages
                </NavLink>
              </li>
            </ul>

            {/* PROFILE DROPDOWN */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 hover:bg-gray-100 p-2 rounded-full transition focus:outline-none"
              >
                <img
                  src={avatarUrl}
                  alt="profile"
                  className="w-10 h-10 rounded-full border-2 border-purple-100 object-cover"
                />
                <div className="hidden md:flex flex-col items-start text-sm">
                  <span className="font-semibold text-gray-700">{displayName}</span>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 mb-1">
                    <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>

                  <NavLink
                    to="profil"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition"
                  >
                    <User size={18} /> Mon Profil
                  </NavLink>

                  <NavLink
                    to="settings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition"
                  >
                    <Settings size={18} /> Paramètres
                  </NavLink>

                  <div className="border-t border-gray-100 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut size={18} /> Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* NAVBAR MOBILE */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t shadow h-16">
        <ul className="relative flex justify-around items-center py-3 text-xs font-medium">
          <li>
            <NavLink to="." end className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? activeClass : normalClass}`}>
              <Home size={22} /> Accueil
            </NavLink>
          </li>
          <li>
            <NavLink to="search" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? activeClass : normalClass}`}>
              <Search size={22} /> Rechercher
            </NavLink>
          </li>
          <li className="relative flex flex-col items-center -translate-y-4">
            <NavLink
              to="plus"
              className="flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-2xl shadow-2xl hover:bg-blue-700 transition duration-300 rotate-45"
            >
              <Plus size={28} className="rotate-45" />
            </NavLink>
          </li>
          <li>
            <NavLink to="notifications" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? activeClass : normalClass}`}>
              <Bell size={22} /> Notifications
            </NavLink>
          </li>
          <li>
            <NavLink to="messages" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? activeClass : normalClass}`}>
              <Mail size={22} /> Messages
            </NavLink>
          </li>
        </ul>
      </nav>
    </>
  );
}