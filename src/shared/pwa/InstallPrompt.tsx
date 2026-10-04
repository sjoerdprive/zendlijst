"use client";

import { useEffect, useState } from "react";
import { useDictionary } from "@/shared/i18n";
import { Button } from "@/shared/ui";
import { isIos, isStandalone, rememberDismissal, wasRecentlyDismissed } from "./installState";
import type { BeforeInstallPromptEvent, InstallMode } from "./types";

// Small banner on phones offering to add the site to the home screen.
export const InstallPrompt = () => {
  const t = useDictionary();
  const [mode, setMode] = useState<InstallMode>("hidden");
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone() || wasRecentlyDismissed()) return;
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setMode("prompt");
    };
    const onInstalled = () => setMode("hidden");
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    // Safari has no install API: explain the share-sheet route instead.
    const timer = isIos() ? window.setTimeout(() => setMode("ios"), 0) : undefined;
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      window.clearTimeout(timer);
    };
  }, []);

  if (mode === "hidden") return null;

  const dismiss = () => {
    rememberDismissal();
    setMode("hidden");
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
      <div role="dialog" aria-label={t.install.title} className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 shadow-lg shadow-ink/10">
        {/* eslint-disable-next-line @next/next/no-img-element -- tiny static icon */}
        <img src="/icons/icon-192.png" alt="" width={40} height={40} className="size-10 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="text-sm font-semibold">{t.install.title}</p>
            <p className="text-sm text-muted">{mode === "ios" ? t.install.iosHint : t.install.body}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {mode === "prompt" && installEvent && (
              <Button
                onClick={async () => {
                  await installEvent.prompt();
                  await installEvent.userChoice;
                  setInstallEvent(null);
                  setMode("hidden");
                }}
              >
                {t.install.install}
              </Button>
            )}
            <Button variant="ghost" onClick={dismiss}>
              {t.install.dismiss}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
