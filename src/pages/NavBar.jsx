import { Home, Search, Bell, Mail, ArrowLeft, User, Plus } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../fakeAuth";

export default function NavBar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const activeClass = "text-purple-600 font-bold";
  const normalClass = "text-gray-600 hover:text-purple-600 transition";

  return (
    <>

      <nav className="w-full h-20 md:h-17 items-center bg-white border-b fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl">
          <div className="flex items-center justify-between">

            {/* LOGO */}
            <p className="text-2xl md:w-42 text-center font-bold text-purple-600">
              SynapseLink
            </p>

          
            <ul className="hidden md:flex text-lg items-center gap-8 font-medium">

              <li>
                <NavLink
                  to="."
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-2 ${
                      isActive ? activeClass : normalClass
                    }`
                  }
                >
                  <Home size={18} />
                  Accueil
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="search"
                  className={({ isActive }) =>
                    `flex items-center gap-2 ${
                      isActive ? activeClass : normalClass
                    }`
                  }
                >
                  <Search size={18} />
                  Rechercher
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="notifications"
                  className={({ isActive }) =>
                    `flex items-center gap-2 ${
                      isActive ? activeClass : normalClass
                    }`
                  }
                >
                  <Bell size={18} />
                  Notifications
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="messages"
                  className={({ isActive }) =>
                    `flex items-center gap-2 ${
                      isActive ? activeClass : normalClass
                    }`
                  }
                >
                  <Mail size={18} />
                  Messages
                </NavLink>
              </li>

            </ul>

            {/* PROFILE et LOGOUT */}
            <div className="flex items-center text-black gap-4">
<NavLink to="profil">
              <div className="hidden md:block items-center gap-2 cursor-pointer hover:opacity-80 transition">
                <img
                  src="backend........."
                  className="w-9 h-9 rounded-full object-cover"
                  alt="profile"
                />
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  Profil
                </span>
              </div></NavLink>

              
              <NavLink
                to="profil"
                className={({ isActive }) =>
                  `text-black md:hidden border h-10 w-10 items-center flex justify-center rounded-full ${
                    isActive ? "text-purple-600" : "hover:text-purple-600"
                  }`
                }
              >
                <User size={24} />
              </NavLink>

              <button
                onClick={handleLogout}
                className="hidden items-center gap-1 text-sm text-red-500 hover:text-red-600 transition"
              >
                <ArrowLeft size={16} />
                Déconnexion
              </button>

            </div>
          </div>
        </div>
      </nav>


      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t shadow h-16">
        <ul className="relative flex justify-around items-center py-3 text-xs font-medium">

          <li>
            <NavLink
              to="."
              end
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 ${
                  isActive ? activeClass : normalClass
                }`
              }
            >
              <Home size={22} />
              Accueil
            </NavLink>
          </li>

          <li>
            <NavLink
              to="search"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 ${
                  isActive ? activeClass : normalClass
                }`
              }
            >
              <Search size={22} />
              Rechercher
            </NavLink>
          </li>

        
          <li className="relative flex flex-col items-center -translate-y-4">
            <NavLink
              to="plus"
              className="flex items-center justify-center w-16 h-16 
                         bg-blue-600 text-white rounded-2xl 
                         shadow-2xl hover:bg-blue-700 
                         transition duration-300 rotate-45"
            >
              <Plus size={28} className="rotate-45" />
            </NavLink>
          </li>

          <li>
            <NavLink
              to="notifications"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 ${
                  isActive ? activeClass : normalClass
                }`
              }
            >
              <Bell size={22} />
              Notifications
            </NavLink>
          </li>

          <li>
            <NavLink
              to="messages"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 ${
                  isActive ? activeClass : normalClass
                }`
              }
            >
              <Mail size={22} />
              Messages
            </NavLink>
          </li>

        </ul>
      </nav>
    </>
  );
}
