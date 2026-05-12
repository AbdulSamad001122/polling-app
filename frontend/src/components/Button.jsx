export const Button = ({ children, variant = "primary", className = "", ...props }) => {
  const variants = {
    primary: "bg-secondary text-primary hover:opacity-90",
    secondary: "bg-transparent border-2 border-secondary text-secondary hover:bg-secondary hover:text-primary",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      {...props}
      className={`px-6 py-2 rounded-lg font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};
