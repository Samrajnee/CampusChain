export default function Input({
  label,
  error,
  className = '',
  ...props
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          className="text-xs font-sans font-medium"
          style={{ color: 'var(--text-3)', letterSpacing: '0.04em' }}
        >
          {label.toUpperCase()}
        </label>
      )}
      <input
        {...props}
        className={`w-full px-4 py-2.5 text-sm font-sans rounded-lg transition-all duration-150 ${className}`}
        style={{
          background: 'var(--white)',
          border: error ? '1px solid #FCA5A5' : '1px solid var(--border)',
          color: 'var(--text-1)',
          outline: 'none',
          boxShadow: error
            ? '0 0 0 3px rgba(252,165,165,0.2)'
            : '0 1px 2px rgba(11,17,32,0.04)',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = error ? '#F87171' : '#C9A96E';
          e.currentTarget.style.boxShadow = error
            ? '0 0 0 3px rgba(252,165,165,0.2)'
            : '0 0 0 3px rgba(201,169,110,0.2)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? '#FCA5A5' : 'var(--border)';
          e.currentTarget.style.boxShadow = error
            ? '0 0 0 3px rgba(252,165,165,0.2)'
            : '0 1px 2px rgba(11,17,32,0.04)';
        }}
      />
      {error && (
        <p className="text-xs font-sans" style={{ color: '#EF4444' }}>
          {error}
        </p>
      )}
    </div>
  );
}