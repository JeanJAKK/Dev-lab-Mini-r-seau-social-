import React from "react";
import CreatePost from "./CreatePost";
import { useTheme } from "../context/ThemeContext";

function Plus() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <>
      <div
        className={`${isDark ? "bg-slate-950" : "bg-slate-50"} min-h-screen md:top-20 top-23 px-2 sm:px-4 md:px-10 relative`}
      >
        <CreatePost />{" "}
      </div>
    </>
  );
}

export default Plus;
