import { createContext, useContext, useState, type ReactNode } from "react";

export type Theme = "dark" | "light";
// Keep the original key so existing Recall Atlas users retain their preference.
const storageKey = "polity-atlas-theme";
export function readTheme(): Theme {
  try {
    return localStorage.getItem(storageKey) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}
const ThemeContext = createContext({
  theme: "dark" as Theme,
  toggleTheme: () => {},
});
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState(readTheme);
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try {
      localStorage.setItem(storageKey, next);
    } catch {
      // A blocked storage area must not prevent changing this session's theme.
    }
  };
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
export const useTheme = () => useContext(ThemeContext);
