export type ActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> }
  // Ask the client for a full page load (see useFullPageRedirect).
  | { status: "redirect"; to: string };

export const IDLE_STATE: ActionState = { status: "idle" };

export const actionError = (
  message: string,
  fieldErrors?: Record<string, string[]>,
): ActionState => ({ status: "error", message, fieldErrors });

export const actionSuccess = (message: string): ActionState => ({
  status: "success",
  message,
});

export const actionRedirect = (to: string): ActionState => ({ status: "redirect", to });
