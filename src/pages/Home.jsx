import React from "react";
import NavBar from "./NavBar";
import { Outlet } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function Home() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <>
      <NavBar />
<<<<<<< Updated upstream
      
      <main style={{ paddingTop: '72px' }}>
        <Outlet />
      </main>
=======

      <div
        style={{
          minHeight: "calc(100vh - 80px)",
          background: isDark ? "#111827" : "#f8fafc",
          marginTop: "80px",
        }}
      >
        <Outlet />
      </div>
>>>>>>> Stashed changes
    </>
  );
}
