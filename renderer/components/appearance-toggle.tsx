import * as React from "react";
import { Button } from "@glaze/core/components";
import { Sun, Moon } from "lucide-react";

// Quick light/dark switch for the main window. The full Auto/Light/Dark control
// still lives in Settings; this just flips the effective appearance in place.
export function AppearanceToggle() {
  const [isDark, setIsDark] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    let active = true;
    window.glazeAPI.nativeTheme.getShouldUseDarkColors().then((dark) => {
      if (active) setIsDark(dark);
    });

    // Keep the icon in sync when the OS appearance changes while on "system".
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
    media.addEventListener("change", onChange);
    return () => {
      active = false;
      media.removeEventListener("change", onChange);
    };
  }, []);

  const toggle = async () => {
    const next = !isDark;
    setIsDark(next);
    await window.glazeAPI.nativeTheme.setThemeSource(next ? "dark" : "light");
  };

  return (
    <Button
      iconOnly
      variant="glass"
      size="medium"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </Button>
  );
}
