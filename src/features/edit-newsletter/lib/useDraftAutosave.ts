"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { saveDraftAction } from "../actions";
import type { SaveDraftInput, SaveState } from "../types";

const DEBOUNCE_MS = 1500;

interface AutosaveOptions {
  initialVersion: number;
  initialHasContent: boolean;
  // Reads the latest form values at save time.
  collect: () => Omit<SaveDraftInput, "version">;
  leaveWarning: string;
}

/*
 * Saves a short while after the last change. Saves run one after another, each
 * sending the version it last got back, so the server can refuse to overwrite
 * someone else's newer save (conflict) instead of silently losing it.
 */
export const useDraftAutosave = ({ initialVersion, initialHasContent, collect, leaveWarning }: AutosaveOptions) => {
  const [state, setState] = useState<SaveState>("saved");
  const [message, setMessage] = useState<string | null>(null);
  const [version, setVersion] = useState(initialVersion);
  const [hasContent, setHasContent] = useState(initialHasContent);

  const collectRef = useRef(collect);
  const versionRef = useRef(initialVersion);
  const editsRef = useRef(0);
  const savedEditsRef = useRef(0);
  const stoppedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queueRef = useRef<Promise<boolean>>(Promise.resolve(true));

  useEffect(() => {
    collectRef.current = collect;
  });

  const saveNow = useCallback(async (): Promise<boolean> => {
    if (stoppedRef.current) return false;
    const edits = editsRef.current;
    if (edits === savedEditsRef.current) return true;
    setState("saving");
    try {
      const result = await saveDraftAction({ ...collectRef.current(), version: versionRef.current });
      if (result.status === "saved") {
        versionRef.current = result.version;
        savedEditsRef.current = edits;
        setVersion(result.version);
        setHasContent(result.hasContent);
        setMessage(null);
        setState(editsRef.current === edits ? "saved" : "unsaved");
        return true;
      }
      if (result.status === "error") {
        setMessage(result.message);
        setState("error");
        return false;
      }
      stoppedRef.current = true;
      setState(result.status);
      return false;
    } catch {
      setMessage(null);
      setState("error");
      return false;
    }
  }, []);

  // Queued so two saves never race with the same version.
  const save = useCallback((): Promise<boolean> => {
    queueRef.current = queueRef.current.then(saveNow, saveNow);
    return queueRef.current;
  }, [saveNow]);

  const markChanged = useCallback(() => {
    if (stoppedRef.current) return;
    editsRef.current += 1;
    setState((current) => (current === "saving" ? current : "unsaved"));
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => void save(), DEBOUNCE_MS);
  }, [save]);

  // Saves pending changes right away (before scheduling, uploading, …).
  const flush = useCallback((): Promise<boolean> => {
    if (timerRef.current) clearTimeout(timerRef.current);
    return save();
  }, [save]);

  // Stops autosaving, e.g. right before the newsletter is deleted.
  const discard = useCallback(() => {
    stoppedRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (editsRef.current !== savedEditsRef.current && !stoppedRef.current) {
        event.preventDefault();
        event.returnValue = leaveWarning;
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => {
      window.removeEventListener("beforeunload", warn);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [leaveWarning]);

  return { state, message, version, hasContent, markChanged, flush, discard };
};
