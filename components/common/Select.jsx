export const Select = ({ label, error, required = false, children, className = "", ...props }) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <select
        className={`w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${error ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500" : ""} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </div>
  );
};
