import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { getGrievances, createGrievance } from '../../api/governance';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import Empty from '../../components/ui/Empty';
import Spinner from '../../components/ui/Skeleton';

const ADMIN_ROLES = ['TEACHER', 'HOD', 'LAB_ASSISTANT', 'LIBRARIAN', 'PRINCIPAL', 'SUPER_ADMIN'];

function fmt(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

const STATUS_COLORS = {
  SUBMITTED:    { bg: '#EFF6FF', color: '#1D4ED8' },
  UNDER_REVIEW: { bg: '#FFFBEB', color: '#92400E' },
  ESCALATED:    { bg: '#FFF1F2', color: '#BE123C' },
  RESOLVED:     { bg: '#F0FDF4', color: '#15803D' },
  CLOSED:       { bg: 'var(--surface-2)', color: 'var(--text-4)' },
};

export default function GrievancesPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const isAdmin = ADMIN_ROLES.includes(user?.role);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', isAnonymous: false });
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['grievances'],
    queryFn: getGrievances,
  });

  const grievances = data?.data?.grievances ?? [];

  const createMut = useMutation({
    mutationFn: createGrievance,
    onSuccess: () => {
      qc.invalidateQueries(['grievances']);
      setShowForm(false);
      setForm({ title: '', description: '', isAnonymous: false });
    },
    onError: (e) => setError(e.response?.data?.message || 'Failed to submit'),
  });

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Grievances"
        subtitle={isAdmin ? 'Review and resolve student grievances' : 'Raise a concern with the institution'}
        action={
          !isAdmin && (
            <Button variant="primary" onClick={() => setShowForm((s) => !s)}>
              {showForm ? 'Cancel' : 'Raise grievance'}
            </Button>
          )
        }
      />

      {showForm && (
        <Card className="p-6 mb-6 animate-fade-up">
          <p className="text-sm font-sans font-semibold text-t1 mb-4">
            Submit a grievance
          </p>
          <Alert type="error" message={error} />
          <div className="flex flex-col gap-4">
            <Input
              label="Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Brief description of the issue"
            />
            <div>
              <label className="block text-xs font-sans font-medium mb-1.5 uppercase tracking-widest"
                style={{ color: 'var(--text-3)' }}>
                Details
              </label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Describe the issue in detail..."
                className="w-full px-4 py-2.5 text-sm font-sans rounded-lg resize-none transition-all duration-150"
                style={{
                  background: 'var(--white)', border: '1px solid var(--border)',
                  color: 'var(--text-1)', outline: 'none',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#C9A96E';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,169,110,0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setForm((f) => ({ ...f, isAnonymous: !f.isAnonymous }))}
                className="w-10 h-5 rounded-full transition-colors relative cursor-pointer"
                style={{ background: form.isAnonymous ? '#C9A96E' : 'var(--border)' }}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  form.isAnonymous ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </div>
              <span className="text-sm font-sans" style={{ color: 'var(--text-2)' }}>
                Submit anonymously
              </span>
            </label>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button
                variant="primary"
                loading={createMut.isPending}
                disabled={!form.title.trim() || !form.description.trim()}
                onClick={() => createMut.mutate(form)}
              >
                Submit
              </Button>
            </div>
          </div>
        </Card>
      )}

      {isLoading ? (
        <Spinner />
      ) : grievances.length === 0 ? (
        <Empty
          message="No grievances"
          sub={isAdmin ? 'No grievances have been submitted' : 'You have not raised any grievances'}
        />
      ) : (
        <div className="flex flex-col gap-3 stagger">
          {grievances.map((g) => {
            const sc = STATUS_COLORS[g.status] ?? STATUS_COLORS.CLOSED;
            return (
              <Card key={g.id} className="p-5 animate-fade-up">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-sm font-sans font-semibold text-t1 flex-1">
                    {g.title}
                  </h3>
                  <span
                    className="text-xs font-sans font-semibold px-2.5 py-1 rounded-full shrink-0"
                    style={{ background: sc.bg, color: sc.color }}
                  >
                    {g.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm font-sans line-clamp-2 mb-3"
                  style={{ color: 'var(--text-3)' }}>
                  {g.description}
                </p>
                {g.adminNote && (
                  <div className="rounded-lg px-3 py-2 mb-3"
                    style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                    <p className="text-xs font-sans font-semibold mb-0.5"
                      style={{ color: '#92400E' }}>
                      Admin note
                    </p>
                    <p className="text-xs font-sans" style={{ color: '#78350F' }}>
                      {g.adminNote}
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs font-sans"
                  style={{ color: 'var(--text-4)' }}>
                  <span>{g.isAnonymous ? 'Anonymous' : 'You'}</span>
                  <span>{fmt(g.createdAt)}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}