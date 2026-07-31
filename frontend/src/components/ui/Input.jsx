import { forwardRef } from "react";

const Input = forwardRef(({ label, error, className = "", ...props }, ref) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-muted mb-1.5">{label}</label>}
    <input ref={ref} className={`input-field ${error ? "border-rose-500" : ""} ${className}`} {...props} />
    {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
  </div>
));

Input.displayName = "Input";
export default Input;
