export default function SectionLabel({ children }) {
  return (
    <p
      className="text-xs font-sans font-semibold mb-3"
      style={{
        color: 'var(--text-4)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}
    >
      {children}
    </p>
  );
}