export default function Avatar({
  avatarUrl,
  name = '',
  size = 'md',
  className = '',
}) {
  const sizes = {
    xs:  { box: 'w-6 h-6',   text: 'text-xs',  radius: '6px' },
    sm:  { box: 'w-8 h-8',   text: 'text-sm',  radius: '8px' },
    md:  { box: 'w-10 h-10', text: 'text-sm',  radius: '10px' },
    lg:  { box: 'w-14 h-14', text: 'text-xl',  radius: '12px' },
    xl:  { box: 'w-20 h-20', text: 'text-2xl', radius: '16px' },
  };

  const s = sizes[size] ?? sizes.md;
  const initial = name?.charAt(0)?.toUpperCase() ?? '?';

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${s.box} object-cover shrink-0 ${className}`}
        style={{ borderRadius: s.radius }}
      />
    );
  }

  return (
    <div
      className={`${s.box} flex items-center justify-center font-sans font-semibold shrink-0 ${s.text} ${className}`}
      style={{
        background: 'var(--surface-2)',
        color: 'var(--text-3)',
        borderRadius: s.radius,
      }}
    >
      {initial}
    </div>
  );
}