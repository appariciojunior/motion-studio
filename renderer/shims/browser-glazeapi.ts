/**
 * Stubs window.glazeAPI for the browser build so renderer code that
 * checks `window.glazeAPI?.glaze?.ipc?.disconnect()` doesn't throw.
 */

if (typeof window !== "undefined" && !("glazeAPI" in window)) {
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
          shouldUseDarkColors: window.matchMedia("(prefers-color-scheme: dark)").matches,
          themeSource: "system" as const,
        }),
      setThemeSource: () => Promise.resolve(true),
      getShouldUseDarkColors: () =>
        Promise.resolve(window.matchMedia("(prefers-color-scheme: dark)").matches),
      getThemeSource: () => Promise.resolve("system" as const),
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
