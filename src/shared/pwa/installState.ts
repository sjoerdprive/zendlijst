const DISMISS_KEY = "zendlijst:install-dismissed-at";
const DISMISS_DAYS = 30;

export const isStandalone = (): boolean =>
  window.matchMedia("(display-mode: standalone)").matches ||
  ("standalone" in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true);

// iPadOS reports itself as a Mac, so also check for touch support.
export const isIos = (): boolean =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1);

export const wasRecentlyDismissed = (): boolean => {
  try {
    const value = Number(window.localStorage.getItem(DISMISS_KEY));
    return Boolean(value) && Date.now() - value < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
};

export const rememberDismissal = (): void => {
  try {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // Storage can be unavailable (private mode); the banner then simply returns next visit.
  }
};
