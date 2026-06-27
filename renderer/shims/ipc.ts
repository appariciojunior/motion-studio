/**
 * Browser shims for @glaze/core/ipc and @glaze/core/preload — type stubs only.
 * These modules are not used in the browser build; this file satisfies the
 * TypeScript import checker without pulling in any Glaze runtime code.
 */

export type NativeThemeInfo = {
  shouldUseDarkColors: boolean;
  themeSource: "system" | "light" | "dark";
};

export type MediaAccessType = "microphone" | "camera";
export type AskForMediaAccessType = MediaAccessType;
export type PermissionStatus = "granted" | "denied" | "restricted" | "unknown" | "not-determined";
export type OpenDialogOptions = Record<string, unknown>;
export type OpenDialogResult = { canceled: boolean; filePaths: string[] };
export type SaveDialogOptions = Record<string, unknown>;
export type SaveDialogResult = { canceled: boolean; filePath?: string };
export type MessageBoxOptions = Record<string, unknown>;
export type MessageBoxResult = { response: number };
export type DatePickerOptions = Record<string, unknown>;
export type DatePickerResult = { canceled: boolean; date?: string };
export type LocationPosition = { latitude: number; longitude: number };
export type LocationPositionOptions = Record<string, unknown>;
export type PermissionDiagnostic = Record<string, unknown>;
export type MenuItemConstructorOptions = Record<string, unknown>;
export type PopupOptions = Record<string, unknown>;
export type PopupResult = Record<string, unknown>;
export type SystemPreferencesAuthorizationType = string;
export type SystemPreferencesNotificationCallback = (...args: unknown[]) => void;
export type SystemPreferencesNotificationPayload = Record<string, unknown>;
export type SystemPreferencesPreferredScrollerStyle = string;

// Preload-side exports (never actually called in browser renderer)
export const ipcRenderer = {} as never;
export const contextBridge = {} as never;
export const createWebUtilsAPI = () => ({}) as never;
export const installDisplayMediaCompat = () => {};
