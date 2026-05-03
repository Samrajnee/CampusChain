import { forwardRef } from 'react';

const base =
  'inline-flex items-center justify-center gap-2 font-sans text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2';

const variants = {
  primary: {
    className: `${base} px-5 py-2.5 text-white`,
    style: {
      background: 'linear-gradient(135deg, #C9A96E 0%, #B8934A 100%)',
      boxShadow: '0 1px 3px rgba(184,147,74,0.4)',
    },
    hoverStyle: {
      background: 'linear-gradient(135deg, #D4B47C 0%, #C9A96E 100%)',
      boxShadow: '0 4px 12px rgba(184,147,74,0.35)',
      transform: 'translateY(-1px)',
    },
  },
  secondary: {
    className: `${base} px-5 py-2.5`,
    style: {
      background: 'var(--white)',
      border: '1px solid var(--border)',
      color: 'var(--text-2)',
      boxShadow: '0 1px 2px rgba(11,17,32,0.05)',
    },
    hoverStyle: {
      borderColor: 'var(--border-dim)',
      color: 'var(--text-1)',
      boxShadow: '0 2px 8px rgba(11,17,32,0.08)',
    },
  },
  ghost: {
    className: `${base} px-4 py-2`,
    style: { color: 'var(--text-3)', background: 'transparent' },
    hoverStyle: { background: 'var(--surface-2)', color: 'var(--text-1)' },
  },
  danger: {
    className: `${base} px-5 py-2.5`,
    style: {
      background: '#FEF2F2',
      border: '1px solid #FECACA',
      color: '#DC2626',
    },
    hoverStyle: { background: '#FEE2E2', borderColor: '#FCA5A5' },
  },
  gold: {
    className: `${base} px-5 py-2.5`,
    style: {
      border: '1px solid #C9A96E',
      color: '#C9A96E',
      background: 'transparent',
    },
    hoverStyle: { background: 'rgba(201,169,110,0.08)', color: '#B8934A' },
  },
};

const Spinner = () => (
  <svg
    className="w-4 h-4 animate-spin"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12" cy="12" r="10"
      stroke="currentColor" strokeWidth="3"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

const Button = forwardRef(function Button(
  { variant = 'primary', loading, disabled, children, onClick, type = 'button', className = '' },
  ref
) {
  const v = variants[variant] ?? variants.primary;

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${v.className} ${className}`}
      style={v.style}
      onMouseEnter={(e) => {
        if (disabled || loading) return;
        Object.assign(e.currentTarget.style, v.hoverStyle);
      }}
      onMouseLeave={(e) => {
        Object.assign(e.currentTarget.style, v.style);
      }}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
});

export default Button;