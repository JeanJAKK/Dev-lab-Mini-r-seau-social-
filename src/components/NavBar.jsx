import { useState, useRef, useEffect } from "react";
import { Home, Search, Bell, Mail, User, Plus, Settings, ChevronDown, LogOut } from "lucide-react";
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
  const [notificationsNonLues, setNotificationsNonLues] = useState(0);

  const chargerNotifNonLues = async (userId) => {
    if (!userId) return;
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('destinataire_id', userId)
        .eq('est_lu', false);
      if (!error) setNotificationsNonLues(count || 0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser(user);
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name, avatar_url')
            .eq('id', user.id)
            .single();
          if (profileData) setUserProfile(profileData);
          await chargerNotifNonLues(user.id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!currentUser?.id) return;
    const subscription = supabase
      .channel('notifications-count')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `destinataire_id=eq.${currentUser.id}`
      }, () => chargerNotifNonLues(currentUser.id))
      .subscribe();
    return () => subscription.unsubscribe();
  }, [currentUser?.id]);

  const displayName = userProfile?.name || currentUser?.email?.split('@')[0] || 'Utilisateur';
  const avatarUrl = userProfile?.avatar_url || `https://ui-avatars.com/api/?name=${displayName}&background=7c3aed&color=fff`;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/authPage", { replace: true });
  };

  const activeClass = "text-purple-600 font-bold";
  const normalClass = isDark ? "text-gray-300 hover:text-purple-400 transition" : "text-gray-600 hover:text-purple-600 transition";

  return (
    <>
      {/* Desktop Navbar */}
      <nav className={`w-full h-16 flex items-center border-b fixed top-0 left-0 right-0 z-50 shadow-sm ${isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-100"}`}>
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="flex items-center justify-between">
            <p className="text-xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">
              SynapseLink
            </p>

            <ul className="hidden md:flex text-sm items-center gap-6 font-medium">
              <li><NavLink to="." end className={({ isActive }) => `flex items-center gap-2 ${isActive ? activeClass : normalClass}`}><Home size={18} /> Accueil</NavLink></li>
              <li><NavLink to="search" className={({ isActive }) => `flex items-center gap-2 ${isActive ? activeClass : normalClass}`}><Search size={18} /> Rechercher</NavLink></li>
              <li className="relative">
                <NavLink to="notifications" className={({ isActive }) => `flex items-center gap-2 ${isActive ? activeClass : normalClass}`}>
                  <Bell size={18} /> Notifications
                  {notificationsNonLues > 0 && (
                    <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                      {notificationsNonLues > 99 ? '99+' : notificationsNonLues}
                    </span>
                  )}
                </NavLink>
              </li>
              <li><NavLink to="messages" className={({ isActive }) => `flex items-center gap-2 ${isActive ? activeClass : normalClass}`}><Mail size={18} /> Messages</NavLink></li>
            </ul>

            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={`flex items-center gap-2 p-1 rounded-full transition ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}>
                <img src={avatarUrl} alt="profile" className="w-9 h-9 rounded-full object-cover border-2 border-purple-500" />
                <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-52 rounded-lg shadow-lg border py-1 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                  <div className={`px-4 py-2 border-b ${isDark ? "border-gray-700" : "border-gray-100"}`}>
                    <p className={`text-sm font-semibold ${isDark ? "text-gray-100" : "text-gray-900"}`}>{displayName}</p>
                    <p className={`text-xs truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>{currentUser?.email}</p>
                  </div>
                  <NavLink to="profil" onClick={() => setIsDropdownOpen(false)} className={`flex items-center gap-3 px-4 py-2 text-sm transition ${isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}`}>
                    <User size={16} /> Mon Profil
                  </NavLink>
                  <NavLink to="settings" onClick={() => setIsDropdownOpen(false)} className={`flex items-center gap-3 px-4 py-2 text-sm transition ${isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}`}>
                    <Settings size={16} /> Paramètres
                  </NavLink>
                  <div className={`border-t my-1 ${isDark ? "border-gray-700" : "border-gray-100"}`}></div>
                  <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition ${isDark ? "text-red-400 hover:bg-gray-700" : "text-red-600 hover:bg-red-50"}`}>
                    <LogOut size={16} /> Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-50 border-t shadow-lg h-14 ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"}`}>
        <ul className="flex justify-around items-center h-full text-xs font-medium">
          <li><NavLink to="." end className={({ isActive }) => `flex flex-col items-center gap-0.5 ${isActive ? activeClass : normalClass}`}><Home size={20} /> Accueil</NavLink></li>
          <li><NavLink to="search" className={({ isActive }) => `flex flex-col items-center gap-0.5 ${isActive ? activeClass : normalClass}`}><Search size={20} /> Rechercher</NavLink></li>
          <li className="relative -translate-y-3">
            <NavLink to="plus" className="flex items-center justify-center w-11 h-11 rounded-full bg-purple-600 text-white shadow-lg">
              <Plus size={22} />
            </NavLink>
          </li>
          <li className="relative">
            <NavLink to="notifications" className={({ isActive }) => `flex flex-col items-center gap-0.5 ${isActive ? activeClass : normalClass}`}>
              <Bell size={20} /> Notifications
              {notificationsNonLues > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[16px] text-center">
                  {notificationsNonLues > 99 ? '99+' : notificationsNonLues}
                </span>
              )}
            </NavLink>
          </li>
          <li><NavLink to="messages" className={({ isActive }) => `flex flex-col items-center gap-0.5 ${isActive ? activeClass : normalClass}`}><Mail size={20} /> Messages</NavLink></li>
        </ul>
      </nav>
    </>
  );
}