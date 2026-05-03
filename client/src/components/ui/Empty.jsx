export default function Empty({ message = 'Nothing here yet', sub }) {
  return (
    <div
      className="rounded-xl bg-white py-16 px-8 text-center"
      style={{ border: '1px solid var(--border)' }}
    >
      <div
        className="w-10 h-10 rounded-full mx-auto mb-4 flex items-center justify-center"
        style={{ background: 'var(--surface-2)' }}
      >
        <svg
          className="w-5 h-5"
          style={{ color: 'var(--text-4)' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <p
        className="text-sm font-sans font-medium"
        style={{ color: 'var(--text-2)' }}
      >
        {message}
      </p>
      {sub && (
        <p
          className="text-xs font-sans mt-1"
          style={{ color: 'var(--text-4)' }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}