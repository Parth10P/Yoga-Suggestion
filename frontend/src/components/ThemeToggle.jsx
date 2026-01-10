import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-3 md:p-4 rounded-full bg-white/10 dark:bg-zinc-800/50 backdrop-blur-md border border-gray-200 dark:border-zinc-700 shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 group z-50 fixed top-6 right-6"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-8 h-8 text-yellow-400 fill-yellow-400/20 rotate-0 transition-all duration-500 group-hover:rotate-180" />
      ) : (
        <Moon className="w-8 h-8 text-indigo-600 fill-indigo-600/20 rotate-0 transition-all duration-500 group-hover:-rotate-12" />
      )}
    </button>
  );
}
