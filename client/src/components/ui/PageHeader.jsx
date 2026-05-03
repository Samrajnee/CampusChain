export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-end justify-between mb-10 animate-fade-up">
      <div>
        <h1
          className="font-display text-3xl text-t1"
          style={{ fontWeight: 300, letterSpacing: '-0.03em' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="text-sm font-sans mt-1.5"
            style={{ color: 'var(--text-3)' }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}