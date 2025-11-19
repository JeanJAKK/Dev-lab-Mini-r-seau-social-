import React from "react";
import { Home, Search, Bell, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <ul
      className="md:hidden fixed bottom-0 left-0 right-0 
      flex items-center justify-around gap-6 
      font-medium text-gray-700 bg-white p-4 shadow-lg"
    >
      <li title="Accueil" className="flex flex-col items-center text-sm hover:text-purple-600 cursor-pointer">
        
        <Link to="/Acceuil"><Home size={22} /></Link>
      </li>

      <li title="Rechercher" className="flex flex-col items-center text-sm hover:text-purple-600 cursor-pointer">
        <Search size={22} />
        <Link to="/search"></Link>
      </li>

      <li title="Notifications" className="flex flex-col items-center text-sm hover:text-purple-600 cursor-pointer">
        <Bell size={22} />
        <Link to="/notifications"></Link>
      </li>

      <li title="Messages" className="flex flex-col items-center text-sm hover:text-purple-600 cursor-pointer">
        <Mail size={22} />
        <Link to="/messages"></Link>
      </li>
    </ul>
  );
}
 