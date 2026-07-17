import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();
const THEME_STORAGE_KEY = "theme";

function getStoredTheme() {
  if (typeof window === "undefined") return "light";

  try {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return storedTheme === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function applyThemeToDocument(theme) {
  if (typeof document === "undefined") return;

  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;

  if (document.body) {
    document.body.setAttribute("data-theme", theme);
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getStoredTheme);

  useEffect(() => {
    applyThemeToDocument(theme);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage failures, the in-memory theme still works.
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
