import type { FieldProps } from "./types";

export const Field = ({ label, name, hint, errors, children }: FieldProps) => (
  <div className="space-y-1.5">
    <label htmlFor={name} className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">
      {label}
    </label>
    {children}
    {hint && <p className="text-xs text-zinc-500">{hint}</p>}
    {errors?.map((error) => (
      <p key={error} className="text-xs text-red-600">
        {error}
      </p>
    ))}
  </div>
);
