export const Card = ({ children, className = "", padding = "default", variant = "default", hover = true }) => {
  const paddingClasses = { none: "", small: "p-4", default: "p-6", large: "p-8" };

  const variantClasses = {
    default: "bg-white border-slate-200",
    gradient: "bg-gradient-to-br from-brand-50 via-white to-accent-500/5 border-brand-100",
    glass: "glass-card",
    elevated: "bg-white border-slate-200 shadow-elevated",
  };

  const hoverClass = hover ? "transition-all duration-300 ease-out hover:shadow-elevated hover:-translate-y-0.5 hover:border-brand-200" : "";

  return (
    <div className={`rounded-2xl ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClass} ${className}`}>
      {children}
    </div>
  );
};

// components/common/Modal.jsx
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "medium",
}) => {
  const sizeClasses = {
    small: "max-w-md",
    medium: "max-w-lg",
    large: "max-w-4xl",
    xl: "max-w-6xl",
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
          &#8203;
        </span>

        <div
          className={`inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizeClasses[size]} sm:w-full sm:p-6`}
        >
          {title && (
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};
