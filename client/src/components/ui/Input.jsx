export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition
          ${error
            ? 'border-red-400 focus:ring-2 focus:ring-red-200'
            : 'border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
          } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}