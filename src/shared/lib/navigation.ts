"use client";

import { useEffect } from "react";
import type { ActionState } from "./actionState";

/*
 * Server actions must not call redirect() on tenant subdomains: Next.js renders
 * the target inside the action request, which skips the subdomain rewrite in
 * src/proxy.ts and shows the platform home instead (a dead end in the installed
 * app). A full page load goes through the proxy and picks up new cookies.
 */
export const navigateTo = (path: string): void => {
  window.location.assign(path);
};

export const useFullPageRedirect = (state: ActionState): void => {
  useEffect(() => {
    if (state.status === "redirect") navigateTo(state.to);
  }, [state]);
};
