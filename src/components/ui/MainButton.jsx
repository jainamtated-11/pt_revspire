import React from "react";
import classNames from "classnames";

const buttonVariants = {
  primary: "bg-secondary text-white hover:bg-secondary/80",
  success: "bg-green-500 text-white hover:bg-green-600",
  error: "bg-red-500 text-white hover:bg-red-600",
  outlineBlue: "border border-secondary text-secondary hover:bg-secondary/10",
  textBlue: "text-secondary hover:bg-secondary/10",
  full: "w-full",
  disabled: "bg-gray-300 text-gray-500 cursor-not-allowed",
};

const MainButton = ({
  variant = "primary",
  fullWidth = false,
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  children,
  onClick,
  className = "",
}) => {
  return (
    <button
      className={classNames(
        "flex items-center justify-center gap-2 px-4 py-4 rounded-md text-sm font-medium transition-all",
        buttonVariants[variant],
        fullWidth && buttonVariants.full,
        disabled && buttonVariants.disabled,
        className
      )}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
    >
      {LeftIcon && <LeftIcon className="w-5 h-5" />}
      {children}
      {RightIcon && <RightIcon className="w-5 h-5" />}
    </button>
  );
};

export default MainButton;
