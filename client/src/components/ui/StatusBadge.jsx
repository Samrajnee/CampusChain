const STATUS_MAP = {
  // Elections
  DRAFT:          { bg: '#F1F5F9', color: '#64748B' },
  OPEN:           { bg: '#F0FDF4', color: '#15803D' },
  CLOSED:         { bg: '#F1F5F9', color: '#64748B' },
  CANCELLED:      { bg: '#FEF2F2', color: '#B91C1C' },
  // Proposals / Grievances
  UNDER_REVIEW:   { bg: '#FFFBEB', color: '#92400E' },
  ACCEPTED:       { bg: '#F0FDF4', color: '#15803D' },
  REJECTED:       { bg: '#FEF2F2', color: '#B91C1C' },
  ESCALATED:      { bg: '#FFF1F2', color: '#BE123C' },
  RESOLVED:       { bg: '#F0FDF4', color: '#15803D' },
  SUBMITTED:      { bg: '#EFF6FF', color: '#1D4ED8' },
  // Events
  UPCOMING:       { bg: '#EFF6FF', color: '#1D4ED8' },
  ONGOING:        { bg: '#F0FDF4', color: '#15803D' },
  COMPLETED:      { bg: '#F1F5F9', color: '#64748B' },
  // Clubs
  ACTIVE:         { bg: '#F0FDF4', color: '#15803D' },
  INACTIVE:       { bg: '#F1F5F9', color: '#64748B' },
  PENDING_APPROVAL: { bg: '#FFFBEB', color: '#92400E' },
  // Budget
  PENDING:        { bg: '#FFFBEB', color: '#92400E' },
  APPROVED:       { bg: '#F0FDF4', color: '#15803D' },
  DISBURSED:      { bg: '#F5F3FF', color: '#6D28D9' },
  // Mentorship
  ACTIVE_M:       { bg: '#F0FDF4', color: '#15803D' },
};

export default function StatusBadge({ status }) {
  const s = STATUS_MAP[status] ?? { bg: '#F1F5F9', color: '#64748B' };
  const label = status?.replace(/_/g, ' ') ?? '';

  return (
    <span
      className="inline-flex items-center text-xs font-sans font-semibold px-2.5 py-1 rounded-full"
      style={{
        background: s.bg,
        color: s.color,
        letterSpacing: '0.03em',
      }}
    >
      {label}
    </span>
  );
}