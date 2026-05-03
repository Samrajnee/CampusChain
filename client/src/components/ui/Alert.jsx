const config = {
  error: {
    bg:     '#FEF2F2',
    border: '#FECACA',
    text:   '#B91C1C',
    label:  'Error',
  },
  success: {
    bg:     '#F0FDF4',
    border: '#BBF7D0',
    text:   '#15803D',
    label:  'Success',
  },
  info: {
    bg:     '#F0F9FF',
    border: '#BAE6FD',
    text:   '#0369A1',
    label:  'Note',
  },
  warning: {
    bg:     '#FFFBEB',
    border: '#FDE68A',
    text:   '#92400E',
    label:  'Warning',
  },
};

export default function Alert({ type = 'info', message }) {
  if (!message) return null;
  const c = config[type] ?? config.info;

  return (
    <div
      className="px-4 py-3 rounded-xl text-sm font-sans mb-4"
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
      }}
    >
      <span className="font-semibold">{c.label}: </span>
      {message}
    </div>
  );
}