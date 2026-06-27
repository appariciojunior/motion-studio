/**
 * Browser shims for @glaze/core/hooks
 */
import * as React from "react";

export function useTheme() {
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = (dark: boolean) => {
      document.documentElement.classList.toggle("dark", dark);
    };
    apply(mq.matches);
    const handler = (e: MediaQueryListEvent) => apply(e.matches);
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
