const styles = {
  DRAFT:      'bg-gray-100 text-gray-500',
  OPEN:       'bg-green-100 text-green-700',
  CLOSED:     'bg-slate-100 text-slate-600',
  CANCELLED:  'bg-red-100 text-red-500',
  SUBMITTED:  'bg-sky-100 text-sky-700',
  UNDER_REVIEW: 'bg-amber-100 text-amber-700',
  ESCALATED:  'bg-orange-100 text-orange-700',
  RESOLVED:   'bg-green-100 text-green-700',
  ACCEPTED:   'bg-green-100 text-green-700',
  REJECTED:   'bg-red-100 text-red-500',
  PENDING:    'bg-yellow-100 text-yellow-700',
  ACTIVE:     'bg-green-100 text-green-700',
  UPCOMING:   'bg-sky-100 text-sky-700',
  COMPLETED:  'bg-slate-100 text-slate-600',
}

const labels = {
  DRAFT: 'Draft',
  OPEN: 'Open',
  CLOSED: 'Closed',
  CANCELLED: 'Cancelled',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  ESCALATED: 'Escalated',
  RESOLVED: 'Resolved',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  PENDING: 'Pending',
  ACTIVE: 'Active',
  UPCOMING: 'Upcoming',
  COMPLETED: 'Completed',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-500'}`}>
      {labels[status] || status}
    </span>
  )
}