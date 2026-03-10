import "./ui.css";
import { cn } from "./cn";

export function Badge({ variant = "default", className, children, ...rest }) {
  return (
    <span
      className={cn(
        "ui-badge",
        variant === "accent" && "ui-badge--accent",
        variant === "success" && "ui-badge--success",
        variant === "warning" && "ui-badge--warning",
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
