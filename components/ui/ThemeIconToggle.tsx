"use client";

import React from "react";
import { FiMoon, FiSun } from "react-icons/fi";

function isDark(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

export default function ThemeIconToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = React.useState(false);

  React.useEffect(() => {
    setDark(isDark());
  }, []);

  const toggle = React.useCallback(() => {
    if (typeof document === "undefined") return;
    const next = !isDark();
    if (next) {
      document.documentElement.classList.add("dark");
      try { localStorage.setItem("theme", "dark"); } catch {}
    } else {
      document.documentElement.classList.remove("dark");
      try { localStorage.setItem("theme", "light"); } catch {}
    }
    setDark(next);
  }, []);

  return (
    <button type="button" aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} onClick={toggle} className={className}>
      {dark ? <FiSun /> : <FiMoon />}
    </button>
  );
}
