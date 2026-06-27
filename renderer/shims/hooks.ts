/**
 * Browser shims for @glaze/core/hooks
 */
import * as React from "react";

export function useTheme() {
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const applySystemTheme = async () => {
      const source = await window.glazeAPI.nativeTheme.getThemeSource();
      if (source === "system") document.documentElement.classList.toggle("dark", mq.matches);
    };
    void applySystemTheme();
    const handler = () => void applySystemTheme();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
}

export function useConnection() {
  return { data: { connected: true }, error: null, isLoading: false };
}

export function useEnvironment() {
  return { data: { env: "browser" }, error: null, isLoading: false };
}
