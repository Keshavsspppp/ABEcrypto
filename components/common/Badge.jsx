export const Badge = ({ children, variant = "default", size = "medium", className = "" }) => {
  const variants = {
    default: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300",
    primary: "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300",
    success: "bg-gradient-to-r from-emerald-100 to-green-200 text-emerald-800 border border-emerald-300",
    warning: "bg-gradient-to-r from-yellow-100 to-orange-200 text-yellow-800 border border-yellow-300",
    danger: "bg-gradient-to-r from-red-100 to-pink-200 text-red-800 border border-red-300",
    info: "bg-gradient-to-r from-cyan-100 to-teal-200 text-cyan-800 border border-cyan-300",
  };

  const sizes = {
    small: "px-2.5 py-1 text-xs font-semibold",
    medium: "px-3.5 py-1.5 text-sm font-semibold",
    large: "px-4 py-2 text-base font-semibold",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full shadow-sm ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
};
