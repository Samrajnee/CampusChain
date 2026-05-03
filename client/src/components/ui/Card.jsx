export default function Card({ children, className = '', style = {}, hover = false }) {
  return (
    <div
      className={`rounded-xl bg-white transition-all duration-200 ${
        hover ? 'cursor-pointer' : ''
      } ${className}`}
      style={{
        border: '1px solid var(--border)',
        boxShadow: '0 1px 3px rgba(11,17,32,0.06), 0 2px 8px rgba(11,17,32,0.03)',
        ...style,
      }}
      onMouseEnter={
        hover
          ? (e) => {
              e.currentTarget.style.boxShadow =
                '0 4px 24px rgba(11,17,32,0.10), 0 1px 4px rgba(11,17,32,0.06)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          : undefined
      }
      onMouseLeave={
        hover
          ? (e) => {
              e.currentTarget.style.boxShadow =
                '0 1px 3px rgba(11,17,32,0.06), 0 2px 8px rgba(11,17,32,0.03)';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}