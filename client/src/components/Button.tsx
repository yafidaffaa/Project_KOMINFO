import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean; // ✅ tambahkan ini
};

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = "default",
  size = "md",
  className = "",
  disabled = false, // ✅ default false
}) => {
  const base =
    "rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1";

  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    default: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400",
    outline:
      "border border-gray-400 text-gray-700 hover:bg-gray-100 disabled:opacity-50",
    ghost: "text-gray-700 hover:bg-gray-100 disabled:opacity-50",
    destructive:
      "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400",
  };

  const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled} // ✅ apply disabled prop
      className={`${base} ${variants[variant]} ${sizes[size]} ${
        disabled ? "cursor-not-allowed opacity-60" : ""
      } ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
