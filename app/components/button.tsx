import { FC, ReactNode } from "react";
import styles from "@styles/components.module.css";

export type ButtonVariant =
  /** Filled with the faction colour, dark text. "Join our forum" */
  | "solid"
  /** Faction-coloured border + text on transparent. "Gallery" */
  | "outline"
  /** Neutral border + muted text. Destructive / secondary actions */
  | "quiet"
  /** Filled with the surface colour */
  | "surface"
  /** No chrome at all */
  | "bare";

interface ButtonProps {
  onClick?: () => void;
  children: ReactNode;
  type?: "submit" | "reset" | "button";
  variant?: ButtonVariant;
  disabled?: boolean;
  /** Stretch to the full width of the parent */
  block?: boolean;
  title?: string;
  "aria-label"?: string;
  "aria-expanded"?: boolean;
  "aria-pressed"?: boolean;
}

const Button: FC<ButtonProps> = ({
  onClick,
  children,
  type = "button",
  variant = "solid",
  disabled,
  block,
  title,
  ...aria
}) => (
  <button
    type={type}
    disabled={disabled}
    onClick={onClick}
    title={title}
    className={`${styles.btn} ${styles[variant]} ${block ? styles.block : ""}`}
    {...aria}
  >
    {children}
  </button>
);

export default Button;