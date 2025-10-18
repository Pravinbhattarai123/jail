"use client";

import React from "react";
import { FiMoon, FiSun } from "react-icons/fi";

function getIsDark(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

export default function ThemeToggle() {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    setIsDark(getIsDark());
  }, []);

  const toggle = React.useCallback(() => {
    if (typeof document === "undefined") return;
    const next = !getIsDark();
    if (next) {
      document.documentElement.classList.add("dark");
      try { localStorage.setItem("theme", "dark"); } catch {}
    } else {
      document.documentElement.classList.remove("dark");
      try { localStorage.setItem("theme", "light"); } catch {}
    }
    setIsDark(next);
  }, []);

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
      className="fixed bottom-4 right-4 z-[70] inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 dark:border-white/20 bg-white dark:bg-[#0B0B0B] text-black dark:text-white shadow-lg backdrop-blur-sm hover:border-black/20 dark:hover:border-white/30"
      title={isDark ? "Light" : "Dark"}
   >
      {isDark ? <FiSun /> : <FiMoon />}
    </button>
  );
}
