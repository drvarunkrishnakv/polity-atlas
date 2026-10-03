import { Moon, Sun } from "@phosphor-icons/react";
import { useTheme } from "../theme/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const label = `Switch to ${theme === "dark" ? "light" : "dark"} mode`;
  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
      <span>{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}
