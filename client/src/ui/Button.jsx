import "./ui.css";
import { cn } from "./cn";

export function Button({
  variant = "primary",
  className,
  children,
  ...rest
}) {
  return (
    <button
      className={cn(
        "ui-button",
        variant === "subtle" && "ui-button--subtle",
        variant === "ghost" && "ui-button--ghost",
        variant === "danger" && "ui-button--danger",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
