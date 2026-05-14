import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { downloadResume } from '../../api/resume';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import SectionLabel from '../../components/ui/SectionLabel';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

const ADMIN_ROLES = ['TEACHER', 'HOD', 'LAB_ASSISTANT', 'LIBRARIAN', 'PRINCIPAL', 'SUPER_ADMIN'];

const SECTIONS = [
  { label: 'Name, department, year, student ID',         always: true },
  { label: 'Contact email',                               always: true },
  { label: 'Campus XP total and level',                   always: true },
  { label: 'All non-revoked certificates with verify URLs', always: true },
  { label: 'Club memberships with roles',                 always: true },
  { label: 'Completed mentorships',                       always: true },
  { label: 'Earned badges',                               always: true },
  { label: 'CGPA (if visibility is on in profile)',       always: false },
  { label: 'Bio (if added in profile)',                   always: false },
];

export default function ResumePage() {
  const { user } = useAuth();
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [adminId, setAdminId]   = useState('');

  const isAdmin = ADMIN_ROLES.includes(user?.role);
  const name = user?.profile?.firstName
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : user?.email;

  async function handleDownload(userId = null) {
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await downloadResume(userId);
      setSuccess('Resume downloaded.');
    } catch (err) {
      setError(err.message || 'Failed to generate resume');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Resume"
        subtitle="Generate a professional PDF from your campus profile"
      />

      <Alert type="error"   message={error} />
      <Alert type="success" message={success} />

      {/* Preview strip */}
      <Card className="overflow-hidden mb-5">
        <div className="px-7 py-8 flex items-end justify-between"
          style={{ background: 'linear-gradient(135deg, #1E2D4A 0%, #0B1120 100%)' }}>
          <div>
            <p className="text-xs font-sans uppercase tracking-widest mb-2"
              style={{ color: 'rgba(154,163,186,0.7)' }}>
              CampusChain Resume
            </p>
            <p className="font-display text-2xl text-white"
              style={{ fontWeight: 300, letterSpacing: '-0.02em' }}>
              {name}
            </p>
            {user?.studentDetail?.department && (
              <p className="text-sm font-sans mt-1" style={{ color: 'rgba(154,163,186,0.7)' }}>
                {user.studentDetail.department}
                {user.studentDetail.year ? ` · Year ${user.studentDetail.year}` : ''}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs font-sans uppercase tracking-widest mb-1"
              style={{ color: 'rgba(154,163,186,0.5)' }}>
              XP
            </p>
            <p className="font-display text-4xl text-white"
              style={{ fontWeight: 200, letterSpacing: '-0.04em' }}>
              {user?.studentDetail?.xpTotal ?? 0}
            </p>
            <p className="text-xs font-sans" style={{ color: '#C9A96E' }}>
              Level {user?.studentDetail?.level ?? 1}
            </p>
          </div>
        </div>

        <div className="px-7 py-5">
          <SectionLabel>What gets included</SectionLabel>
          <div className="flex flex-col gap-2.5">
            {SECTIONS.map((s) => (
              <div key={s.label} className="flex items-start gap-3">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: s.always ? '#F0FDF4' : '#FFFBEB' }}
                >
                  {s.always ? (
                    <svg className="w-2.5 h-2.5" style={{ color: '#15803D' }}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-2.5 h-2.5" style={{ color: '#92400E' }}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
                    </svg>
                  )}
                </div>
                <p className="text-sm font-sans" style={{ color: 'var(--text-2)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 px-4 py-3 rounded-xl"
            style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
            <p className="text-xs font-sans" style={{ color: '#92400E' }}>
              Items marked with an info icon require profile visibility to be enabled.
            </p>
          </div>

          <Button
            variant="primary"
            loading={loading}
            onClick={() => handleDownload()}
            className="w-full justify-center py-3 mt-5"
          >
            {loading ? 'Generating PDF...' : 'Download Resume as PDF'}
          </Button>

          <p className="text-xs font-sans text-center mt-2" style={{ color: 'var(--text-4)' }}>
            Generated fresh each time with your latest data
          </p>
        </div>
      </Card>

      {/* Admin section */}
      {isAdmin && (
        <Card className="p-6">
          <SectionLabel>Generate for a student</SectionLabel>
          <p className="text-sm font-sans mb-4" style={{ color: 'var(--text-3)' }}>
            Paste a student user UUID to generate their resume
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              placeholder="Student user UUID"
              className="flex-1 px-4 py-2.5 text-sm font-sans rounded-lg transition-all duration-150"
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
            <Button
              variant="secondary"
              loading={loading}
              disabled={!adminId.trim()}
              onClick={() => handleDownload(adminId.trim())}
            >
              Generate
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}