import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppRail } from "./AppRail";
import { CommandPalette } from "./CommandPalette";
import "./app-shell.css";

const THEME_KEY = "nuvora.theme";

function initialTheme(): "light" | "dark" {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function AppShell() {
  const [commandOpen, setCommandOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(initialTheme);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    setCommandOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    const onCommand = () => setCommandOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("nuvora:command", onCommand);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("nuvora:command", onCommand);
    };
  }, []);

  return (
    <div className="app-shell">
      <AppRail
        onCommand={() => setCommandOpen(true)}
        theme={theme}
        onTheme={() =>
          setTheme((current) => (current === "dark" ? "light" : "dark"))
        }
      />
      <main className="app-main">
        <Outlet />
      </main>
      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
      />
    </div>
  );
}
