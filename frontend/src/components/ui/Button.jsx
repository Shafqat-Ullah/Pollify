import clsx from "clsx";
import { Loader2 } from "lucide-react";

const variantClass = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "btn-danger",
};

export default function Button({
  children,
  variant = "primary",
  loading = false,
  className,
  disabled,
  ...props
}) {
  return (
    <button
      className={clsx(variantClass[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
