export const environment = {
  /**
   * Returns the resolved API base URL from environment variables.
   * The app will attempt to use NG_APP_API_BASE, falling back to NG_APP_BACKEND_URL if defined.
   * If neither is defined, returns an empty string, signaling in-memory/local storage usage.
   */
  get apiBaseUrl(): string {
    const meta: any = (import.meta as any) || {};
    const env = meta.env ?? {};
    const win: any = (typeof globalThis !== 'undefined' && (globalThis as any).window) ? (globalThis as any).window : undefined;
    const fromWindow = win && win.__env ? win.__env : {};
    const apiBase = env?.NG_APP_API_BASE || fromWindow.NG_APP_API_BASE;
    const backendUrl = env?.NG_APP_BACKEND_URL || fromWindow.NG_APP_BACKEND_URL;
    const base = (apiBase || backendUrl || '').toString().trim().replace(/\/+$/,'');
    return base;
  },

  /**
   * Returns whether to enable source maps via env override, defaulting to true in development.
   */
  get enableSourceMaps(): boolean {
    const meta: any = (import.meta as any) || {};
    const env = meta.env ?? {};
    const win: any = (typeof globalThis !== 'undefined' && (globalThis as any).window) ? (globalThis as any).window : undefined;
    const fromWindow = win && win.__env ? win.__env : {};
    const v = (env?.NG_APP_ENABLE_SOURCE_MAPS ?? fromWindow.NG_APP_ENABLE_SOURCE_MAPS) as string | undefined;
    if (typeof v === 'string') {
      return ['1','true','yes','on'].includes(v.toLowerCase());
    }
    return true;
  }
};
