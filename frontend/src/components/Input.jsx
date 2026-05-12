export const Input = ({ label, ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-sm font-semibold text-secondary">{label}</label>}
      <input
        {...props}
        className="px-4 py-2 bg-white border-2 border-secondary/20 rounded-lg focus:border-secondary focus:outline-none transition-colors text-dark"
      />
    </div>
  );
};
