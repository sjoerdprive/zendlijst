export type ActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> };

export const IDLE_STATE: ActionState = { status: "idle" };

export const actionError = (
  message: string,
  fieldErrors?: Record<string, string[]>,
): ActionState => ({ status: "error", message, fieldErrors });

export const actionSuccess = (message: string): ActionState => ({
  status: "success",
  message,
});
