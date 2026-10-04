// Chromium's install prompt event; not in the standard DOM typings.
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export type InstallMode = "hidden" | "prompt" | "ios";
