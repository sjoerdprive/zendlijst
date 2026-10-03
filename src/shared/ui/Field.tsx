import type { FieldProps } from "./types";

export const Field = ({ label, name, hint, errors, children }: FieldProps) => (
  <div className="space-y-1.5">
    <label htmlFor={name} className="block text-sm font-semibold">
      {label}
    </label>
    {children}
    {hint && <p className="text-xs text-muted">{hint}</p>}
    {errors?.map((error) => (
      <p key={error} className="text-xs font-medium text-danger">
        {error}
      </p>
    ))}
  </div>
);
