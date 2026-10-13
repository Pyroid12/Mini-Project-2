export type ThemeMode = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "careerbuddy_theme";
export const THEME_CHANGE_EVENT = "careerbuddy-theme-change";

export function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    if (saved === "light" || saved === "dark" || saved === "system") {
      return saved;
    }
  } catch {
    // Ignore storage errors
  }
  return "light";
}

export function applyTheme(mode: ThemeMode) {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  const isDark =
    mode === "dark" ||
    (mode === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (isDark) {
    root.classList.add("dark");
    root.setAttribute("data-theme", "dark");
    if (document.body) {
      document.body.classList.add("dark");
    }
  } else {
    root.classList.remove("dark");
    root.setAttribute("data-theme", "light");
    if (document.body) {
      document.body.classList.remove("dark");
    }
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Ignore storage quota or access errors
  }

  window.dispatchEvent(
    new CustomEvent(THEME_CHANGE_EVENT, { detail: { mode, isDark } })
  );
}

export function isDarkModeActive(): boolean {
  if (typeof window === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}
