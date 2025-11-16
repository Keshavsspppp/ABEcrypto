export const Button = ({
  children,
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  className = "",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden transform hover:scale-[1.03] active:scale-100";

  const variants = {
    primary: "bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 text-white shadow-elevated hover:shadow-glow-lg focus:ring-brand-500",
    secondary: "bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 text-slate-900 shadow-soft focus:ring-slate-500",
    success: "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-elevated focus:ring-emerald-500",
    danger: "bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white shadow-elevated focus:ring-rose-500",
    outline: "border-2 border-brand-300 hover:bg-brand-50 text-brand-700 hover:text-brand-800 hover:border-brand-400 focus:ring-brand-500 bg-white shadow-sm hover:shadow-md",
  };

  const sizes = {
    small: "px-4 py-2.5 text-sm",
    medium: "px-6 py-3 text-base",
    large: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoadingSpinner size="small" color="white" />}
      <span className={loading ? "ml-2" : ""}>{children}</span>
    </button>
  );
};
