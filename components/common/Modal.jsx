export const Modal = ({ isOpen, onClose, title, children, size = "medium" }) => {
  const sizeClasses = { small: "max-w-md", medium: "max-w-lg", large: "max-w-4xl", xl: "max-w-6xl" };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div className={`inline-block align-bottom bg-white/90 backdrop-blur-xl rounded-2xl px-6 pt-6 pb-6 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle ${sizeClasses[size]} sm:w-full sm:p-8 border border-slate-100`}>
          {title && (
            <div className="mb-6 pb-4 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};
