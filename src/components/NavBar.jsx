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
import supabase from "../services/supabase.js";

export default function NavBar() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  
  //  État pour les notifications non lues
  const [notificationsNonLues, setNotificationsNonLues] = useState((5));

  // Charger les données de l'utilisateur connecté
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setCurrentUser(user);
          
          // Récupérer les infos du profil avec avatar
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name, avatar_url')
            .eq('id', user.id)
            .single();
          
          if (profileData) {
            setUserProfile(profileData);
          }
          
          //  CHARGER LE NOMBRE DE NOTIFICATIONS NON LUES
          // ================================================
          // À DÉCOMMENTER APRÈS CRÉATION DE LA TABLE 'notifications'
          // ================================================
          /*
          const { data: notifications, error } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', user.id)
            .eq('is_read', false);
            
          if (!error && notifications) {
            setNotificationsNonLues(notifications.length);
          }
          */
          
          // VERSION MOCKÉE POUR LE TEST (À SUPPRIMER APRÈS)
          setNotificationsNonLues(3); // Valeur de test
        }
      } catch (err) {
        console.error('Erreur chargement utilisateur:', err);
      }
    };
    
    loadUser();
    
    //   LES CHANGEMENTS EN TEMPS RÉEL
    // ================================================
    // À DÉCOMMENTER APRÈS CRÉATION DE LA TABLE
    // ================================================
    /*
    const subscription = supabase
      .channel('notifications-count')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${currentUser?.id}`
        },
        () => {
          // Recharger le compteur quand une notification change
          const refreshCount = async () => {
            const { data: notifications } = await supabase
              .from('notifications')
              .select('id')
              .eq('user_id', currentUser?.id)
              .eq('is_read', false);
            setNotificationsNonLues(notifications?.length || 0);
          };
          refreshCount();
        }
      )
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
    */
  }, []);

  const displayName = userProfile?.name || currentUser?.email?.split('@')[0] || 'Utilisateur';
  const avatarUrl = userProfile?.avatar_url || 
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
  const normalClass = isDark
    ? "text-gray-300 hover:text-purple-400 transition"
    : "text-gray-600 hover:text-purple-600 transition";

  //  Style du badge de notification
  const badgeStyle = {
    position: 'absolute',
    top: '-8px',
    right: '-12px',
    backgroundColor: '#ef4444',
    color: 'white',
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '2px 6px',
    borderRadius: '20px',
    minWidth: '18px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    zIndex: 10
  };

  return (
    <>
      {/* NAVBAR DESKTOP */}
      <nav
        className={`w-full h-19 flex items-center border-b fixed top-0 left-0 right-0 z-50 shadow-sm backdrop-blur-md ${isDark ? "bg-gray-900/95 border-gray-700" : "bg-white/95 border-gray-100"}`}
      >
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="flex items-center justify-between">
            {/* LOGO */}
            <p className="text-xl md:w-44 text-center font-extrabold bg-linear-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent tracking-tight pl-3">
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
              <li className="relative">
                <NavLink
                  to="notifications"
                  className={({ isActive }) =>
                    `flex items-center gap-2 ${isActive ? activeClass : normalClass}`
                  }
                >
                  <Bell size={18} /> Notifications
                  {/* 🔔 BADGE DES NOTIFICATIONS NON LUES */}
                  {notificationsNonLues > 0 && (
                    <span style={badgeStyle}>
                      {notificationsNonLues > 99 ? '99+' : notificationsNonLues}
                    </span>
                  )}
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
                className={`flex items-center gap-3 p-2 rounded-full transition focus:outline-none ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
              >
                <img
                  src={avatarUrl}
                  alt="profile"
                  className={`w-10 h-10 rounded-full border-2 object-cover ${isDark ? "border-purple-800" : "border-purple-100"}`}
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
                      {currentUser?.email}
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
      <nav
        className={`md:hidden fixed bottom-0 left-0 right-0 z-50 border-t shadow-lg h-[72px] pb-[safe] mb-0 ${isDark ? "bg-gray-900/95 border-gray-800" : "bg-white/95 border-gray-100"}`}
      >
        <ul className="relative flex justify-around items-center h-full text-[12px] font-medium">
          <li>
            <NavLink
              to="."
              end
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 ${isActive ? activeClass : normalClass}`
              }
            >
              <Home size={24} /> Accueil
            </NavLink>
          </li>
          <li>
            <NavLink
              to="search"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 ${isActive ? activeClass : normalClass}`
              }
            >
              <Search size={24} /> Rechercher
            </NavLink>
          </li>
          <li className="relative flex flex-col items-center -translate-y-5">
            <NavLink
              to="plus"
              className={`flex items-center justify-center w-14 h-14 rounded-2xl rotate-45 shadow-lg transition duration-300 transform hover:scale-105 active:scale-95 ${isDark ? "bg-purple-600 text-white shadow-purple-900/50" : "bg-linear-to-r from-purple-600 to-indigo-600 text-white shadow-purple-500/40"}`}
            >
              <Plus size={28} className="rotate-45" />
            </NavLink>
          </li>
          <li className="relative">
            <NavLink
              to="notifications"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 ${isActive ? activeClass : normalClass}`
              }
            >
              <Bell size={24} /> Actions
              {/* 🔔 BADGE MOBILE */}
              {notificationsNonLues > 0 && (
                <span style={{
                  ...badgeStyle,
                  top: '-4px',
                  right: '-8px',
                  fontSize: '9px',
                  padding: '1px 4px',
                  minWidth: '14px'
                }}>
                  {notificationsNonLues > 99 ? '99+' : notificationsNonLues}
                </span>
              )}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="messages"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 ${isActive ? activeClass : normalClass}`
              }
            >
              <Mail size={24} /> Messages
            </NavLink>
          </li>
        </ul>
      </nav>
    </>
  );
}