export default function Button({ children, loading, variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:scale-95',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-95',
    ghost: 'text-indigo-600 hover:bg-indigo-50 active:scale-95',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}