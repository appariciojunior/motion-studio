/**
 * Stubs window.glazeAPI for the browser build so renderer code that
 * checks `window.glazeAPI?.glaze?.ipc?.disconnect()` doesn't throw.
 */

type ThemeSource = "system" | "light" | "dark";

const THEME_STORAGE_KEY = "motion-studio-theme";

function storedThemeSource(): ThemeSource {
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "system";
}

function shouldUseDarkColors(source: ThemeSource): boolean {
  return source === "dark" || (source === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
}

function applyThemeSource(source: ThemeSource) {
  document.documentElement.classList.toggle("dark", shouldUseDarkColors(source));
  if (source === "system") window.localStorage.removeItem(THEME_STORAGE_KEY);
  else window.localStorage.setItem(THEME_STORAGE_KEY, source);
}

if (typeof window !== "undefined" && !("glazeAPI" in window)) {
  let themeSource = storedThemeSource();
  applyThemeSource(themeSource);

  (window as Record<string, unknown>).glazeAPI = {
    glaze: {
      ipc: {
        invoke: () => Promise.resolve(undefined),
        send: () => {},
        on: () => () => {},
        once: () => () => {},
        onNotification: () => () => {},
        isConnected: () => true,
        waitForReady: () => Promise.resolve(),
        disconnect: () => {},
      },
    },
    dialog: {
      showOpenDialog: () => Promise.resolve({ canceled: true, filePaths: [] }),
      showSaveDialog: () => Promise.resolve({ canceled: true }),
      showMessageBox: () => Promise.resolve({ response: 0 }),
      showErrorBox: () => Promise.resolve(),
      showDatePicker: () => Promise.resolve({ canceled: true }),
    },
    nativeTheme: {
      getInfo: () =>
        Promise.resolve({
          shouldUseDarkColors: shouldUseDarkColors(themeSource),
          themeSource,
        }),
      setThemeSource: (source: ThemeSource) => {
        themeSource = source;
        applyThemeSource(source);
        return Promise.resolve(true);
      },
      getShouldUseDarkColors: () => Promise.resolve(shouldUseDarkColors(themeSource)),
      getThemeSource: () => Promise.resolve(themeSource),
    },
    shell: { beep: () => {}, beepAsync: () => Promise.resolve() },
    systemPreferences: {
      getMediaAccessStatus: () => Promise.resolve("granted"),
      askForMediaAccess: () => Promise.resolve(true),
      requestScreenCaptureAccess: () => Promise.resolve(true),
      getAuthorizationStatus: () => Promise.resolve("granted"),
      getPreferredScrollerStyle: () => Promise.resolve("overlay"),
      subscribeLocalNotification: () => Promise.resolve(0),
      unsubscribeLocalNotification: () => Promise.resolve(),
    },
    location: { getCurrentPosition: () => Promise.resolve({ latitude: 0, longitude: 0 }) },
    permissions: { getDiagnostics: () => Promise.resolve([]) },
    Menu: {
      popup: () => Promise.resolve({}),
      setApplicationMenu: () => Promise.resolve(),
    },
    webUtils: {},
  };
}

export {};
