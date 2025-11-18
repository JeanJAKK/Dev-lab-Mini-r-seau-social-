import React, { useState } from "react";
import { Home, Search, Bell, Mail, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full h-20 bg-white shadow-md px-4 py-3 flex items-center justify-between">
      
      {/* LOGO */}
      <div className="text-xl font-bold text-purple-600">
        SynapseLink
      </div>

      {/* MENU HAMBURGER MOBILE */}
      <button
        className="md:hidden text-gray-700"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* LINKS */}
      <ul
        className={`md:flex items-center gap-6 font-medium text-gray-700 
        absolute md:static top-16 left-0 w-full md:w-auto bg-white md:bg-transparent p-5 md:p-0 shadow-md md:shadow-none
        transition-all duration-300
        ${open ? "block" : "hidden md:flex"}`}
      >
        <li className="flex items-center gap-2 hover:text-purple-600 cursor-pointer">
          <Home size={20} />
          <Link to="/Acceuil">Accueil</Link>
        </li>

        <li className="flex items-center gap-2 hover:text-purple-600 cursor-pointer">
          <Search size={20} />
          <Link to="/search">Rechercher</Link>
        </li>

        <li className="flex items-center gap-2 hover:text-purple-600 cursor-pointer">
          <Bell size={20} />
          <Link to="/notifications">Notifications</Link>
        </li>

        <li className="flex items-center gap-2 hover:text-purple-600 cursor-pointer">
          <Mail size={20} />
          <Link to="/messages">Messages</Link>
        </li>
      </ul>

      {/* PROFIL */}
      <div className="md:flex items-center gap-2 cursor-pointer">
        <img
          src="backend........."
          alt="profile"
          className="w-9 h-9 rounded-full border"
        />
        <span className="text-black"> Profil </span>
      </div>

    </nav>
  );
}
