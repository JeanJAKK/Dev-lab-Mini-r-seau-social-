import { useState, useRef, useEffect } from "react";
import {
  Home,
  Search,
  Bell,
  Mail,
  ArrowLeft,
  User,
  Plus,
  Settings,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../fakeAuth";
import { useTheme } from "../context/ThemeContext";

export default function NavBar() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // ✅ Mock user frontend-only
  const [user] = useState({
    full_name: "Sophie Martin",
    email: "sophie.martin@example.com",
    avatar_url: "https://i.pravatar.cc/300",
  });

  const displayName = user.full_name;
  const avatarUrl =
    user.avatar_url ||
    `https://ui-avatars.com/api/?name=${displayName}&background=random`;

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
<<<<<<< Updated upstream
  const normalClass = "text-gray-500 hover:text-purple-600 transition-colors duration-150";
=======
  const normalClass = isDark
    ? "text-gray-300 hover:text-purple-400 transition"
    : "text-gray-600 hover:text-purple-600 transition";
>>>>>>> Stashed changes

  return (
    <>
      {/* NAVBAR DESKTOP */}
<<<<<<< Updated upstream
      <nav className="w-full h-16 flex items-center bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="flex items-center justify-between">

=======
      <nav
        className={`w-full h-20 md:h-17 items-center border-b fixed top-0 left-0 right-0 z-50 ${isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-full">
>>>>>>> Stashed changes
            {/* LOGO */}
            <p className="text-xl md:w-44 text-center font-extrabold bg-linear-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent tracking-tight">
              SynapseLink
            </p>

            {/* LINKS */}
            <ul className="hidden md:flex text-sm items-center gap-6 font-medium">
              <li>
                <NavLink
                  to="."
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-2 ${isActive ? activeClass : normalClass}`
                  }
                >
                  <Home size={18} /> Accueil
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="search"
                  className={({ isActive }) =>
                    `flex items-center gap-2 ${isActive ? activeClass : normalClass}`
                  }
                >
                  <Search size={18} /> Rechercher
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="notifications"
                  className={({ isActive }) =>
                    `flex items-center gap-2 ${isActive ? activeClass : normalClass}`
                  }
                >
                  <Bell size={18} /> Notifications
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="messages"
                  className={({ isActive }) =>
                    `flex items-center gap-2 ${isActive ? activeClass : normalClass}`
                  }
                >
                  <Mail size={18} /> Messages
                </NavLink>
              </li>
            </ul>

            {/* PROFILE DROPDOWN */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
<<<<<<< Updated upstream
                className="flex items-center gap-2.5 hover:bg-gray-50 px-3 py-2 rounded-xl transition focus:outline-none border border-transparent hover:border-gray-100"
=======
                className={`flex items-center gap-3 p-2 rounded-full transition focus:outline-none ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
>>>>>>> Stashed changes
              >
                <img
                  src={avatarUrl}
                  alt="profile"
<<<<<<< Updated upstream
                  className="w-8 h-8 rounded-full border-2 border-purple-200 object-cover"
=======
                  className={`w-10 h-10 rounded-full border-2 object-cover ${isDark ? "border-purple-800" : "border-purple-100"}`}
>>>>>>> Stashed changes
                />
                <div className="hidden md:flex flex-col items-start text-sm">
                  <span
                    className={`font-semibold text-sm ${isDark ? "text-gray-200" : "text-gray-700"}`}
                  >
                    {displayName}
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""} ${isDark ? "text-gray-400" : "text-gray-400"}`}
                />
              </button>

              {isDropdownOpen && (
                <div
                  className={`absolute right-0 mt-2 w-56 rounded-xl shadow-lg border py-2 overflow-hidden ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
                >
                  <div
                    className={`px-4 py-3 border-b mb-1 ${isDark ? "border-gray-700" : "border-gray-100"}`}
                  >
                    <p
                      className={`text-sm font-semibold ${isDark ? "text-gray-100" : "text-gray-900"}`}
                    >
                      {displayName}
                    </p>
                    <p
                      className={`text-xs truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {user.email}
                    </p>
                  </div>

                  <NavLink
                    to="profil"
                    onClick={() => setIsDropdownOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2 text-sm transition ${isDark ? "text-gray-300 hover:bg-gray-700 hover:text-purple-400" : "text-gray-700 hover:bg-purple-50 hover:text-purple-700"}`}
                  >
                    <User size={18} /> Mon Profil
                  </NavLink>

                  <NavLink
                    to="settings"
                    onClick={() => setIsDropdownOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2 text-sm transition ${isDark ? "text-gray-300 hover:bg-gray-700 hover:text-purple-400" : "text-gray-700 hover:bg-purple-50 hover:text-purple-700"}`}
                  >
                    <Settings size={18} /> Paramètres
                  </NavLink>

                  <div
                    className={`border-t my-1 ${isDark ? "border-gray-700" : "border-gray-100"}`}
                  ></div>

                  <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition ${isDark ? "text-red-400 hover:bg-gray-700" : "text-red-600 hover:bg-red-50"}`}
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
<<<<<<< Updated upstream
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-100 shadow-lg h-16">
=======
      <nav
        className={`md:hidden fixed bottom-0 left-0 right-0 z-50 border-t shadow h-16 ${isDark ? "bg-gray-900/95 border-gray-700" : "bg-white/95 border-gray-200"}`}
      >
>>>>>>> Stashed changes
        <ul className="relative flex justify-around items-center py-3 text-xs font-medium">
          <li>
            <NavLink
              to="."
              end
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 ${isActive ? activeClass : normalClass}`
              }
            >
              <Home size={22} /> Accueil
            </NavLink>
          </li>
          <li>
            <NavLink
              to="search"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 ${isActive ? activeClass : normalClass}`
              }
            >
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
            <NavLink
              to="notifications"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 ${isActive ? activeClass : normalClass}`
              }
            >
              <Bell size={22} /> Notifications
            </NavLink>
          </li>
          <li>
            <NavLink
              to="messages"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 ${isActive ? activeClass : normalClass}`
              }
            >
              <Mail size={22} /> Messages
            </NavLink>
          </li>
        </ul>
      </nav>
    </>
  );
}
