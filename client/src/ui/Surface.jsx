import "./ui.css";
import { cn } from "./cn";

export function Surface({
  variant = "default",
  padding = "base",
  className,
  children,
  ...rest
}) {
  return (
    <div
      className={cn(
        "surface",
        variant === "glass" && "surface--glass",
        variant === "soft" && "surface--soft",
        padding === "tight" && "surface--tight",
        padding === "loose" && "surface--loose",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
