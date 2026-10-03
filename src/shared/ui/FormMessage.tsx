import { Notice } from "./Notice";
import type { FormMessageProps } from "./types";

export const FormMessage = ({ state }: FormMessageProps) => {
  if (state.status === "idle") return null;
  return <Notice tone={state.status === "success" ? "success" : "danger"}>{state.message}</Notice>;
};
