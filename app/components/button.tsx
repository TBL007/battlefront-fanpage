import { FC, ReactNode } from "react";
import styles from "@styles/components.module.css";
import { boolean } from "better-auth";
interface ButtonProps {
  onClick?: Function | any; // any as type to avoid errors with setState etc
  children: ReactNode;
  type?: "submit" | "reset" | "button";
  muted?: boolean;
  hidden?: boolean;
  disabled?: boolean;
  surface?: boolean;
}
const Button: FC<ButtonProps> = ({
  onClick,
  children,
  muted,
  hidden,
  type,
  disabled,
  surface,
}) => {
  return (
    <button
      disabled={disabled}
      className={
        styles[
          hidden
            ? "btn-hidden"
            : muted
              ? "btn-muted"
              : surface
                ? "btn-srfc"
                : "btn"
        ]
      }
      onClick={() => onClick && onClick()}
      type={type}
    >
      {children}
    </button>
  );
};

export default Button;
