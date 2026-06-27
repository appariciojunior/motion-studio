import * as React from "react";
import { Laptop, Moon, Sun } from "lucide-react";

type ThemeSource = "system" | "dark" | "light";

const THEME_ORDER: ThemeSource[] = ["system", "dark", "light"];

export function AppearanceToggle() {
  const [themeSource, setThemeSource] = React.useState<ThemeSource>("system");

  React.useEffect(() => {
    let active = true;
    window.glazeAPI.nativeTheme.getThemeSource().then((source) => {
      if (active) setThemeSource(source);
    });

    return () => {
      active = false;
    };
  }, []);

  const toggle = async () => {
    const next = THEME_ORDER[(THEME_ORDER.indexOf(themeSource) + 1) % THEME_ORDER.length];
    setThemeSource(next);
    await window.glazeAPI.nativeTheme.setThemeSource(next);
  };

  const label =
    themeSource === "system" ? "Use dark mode" : themeSource === "dark" ? "Use light mode" : "Use system theme";

  return (
    <button
      type="button"
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-black/55 transition-colors hover:text-foreground dark:text-white/50"
      onClick={toggle}
      aria-label={label}
      title={label}
    >
      {themeSource === "system" ? <Laptop size={16} /> : themeSource === "dark" ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
