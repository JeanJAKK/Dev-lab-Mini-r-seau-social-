import React from "react";
import Contact from "./contact";
import { Search } from "lucide-react";
import "./Message.css";
export default function Messages() {
  return (
    <div className="container">
      <div className="contact-section">
        <div className="contact-search">
          <p className="search">
            <label htmlFor="input-search" className="text-black">
              <Search size={22} />
            </label>
            <input type="text" id="input-search" placeholder="Rechercher" />
          </p>
        </div>
        <div className="contact-card">
          <Contact />
        </div>
      </div>

      <div className="discussion">
        <p>discussion</p>
      </div>
    </div>
  );
}
