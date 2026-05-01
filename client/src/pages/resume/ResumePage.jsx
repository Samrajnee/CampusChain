import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { downloadResume } from '../../api/resume';
import { getProfile } from '../../api/identity';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

const ADMIN_ROLES = [
  'TEACHER', 'HOD', 'LAB_ASSISTANT', 'LIBRARIAN', 'PRINCIPAL', 'SUPER_ADMIN',
];

// ── What goes into the resume — shown as a checklist preview ─────────────────

const RESUME_SECTIONS = [
  { label: 'Name, department, year, student ID', always: true },
  { label: 'Contact email', always: true },
  { label: 'Campus XP total and level', always: true },
  { label: 'CGPA (if profile visibility is on)', always: false },
  { label: 'All non-revoked certificates with verify URLs', always: true },
  { label: 'Club memberships with roles (President, Secretary, Member)', always: true },
  { label: 'Completed mentorships', always: true },
  { label: 'Earned badges', always: true },
  { label: 'Bio (from profile)', always: false },
];

export default function ResumePage() {
  const { user } = useAuth();
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const isAdmin = ADMIN_ROLES.includes(user?.role);

  async function handleDownload(userId = null) {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await downloadResume(userId);
      setSuccess('Resume downloaded successfully.');
    } catch (err) {
      setError(err.message || 'Failed to generate resume. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-900">Resume Generator</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Generate a professional PDF resume from your CampusChain profile
        </p>
      </div>

      <Alert type="error"   message={error}   />
      <Alert type="success" message={success}  />

      {/* Main card */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">

        {/* Preview strip — mimics the PDF sidebar */}
        <div className="bg-indigo-600 px-6 py-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold text-indigo-300 uppercase tracking-widest mb-1">
                CampusChain Resume
              </p>
              <p className="text-xl font-bold text-white">
                {user?.profile?.firstName
                  ? `${user.profile.firstName} ${user.profile.lastName}`
                  : user?.email}
              </p>
              {user?.studentDetail?.department && (
                <p className="text-sm text-indigo-300 mt-1">
                  {user.studentDetail.department}
                  {user.studentDetail.year
                    ? ` · Year ${user.studentDetail.year}`
                    : ''}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-indigo-400 uppercase tracking-widest">XP</p>
              <p className="text-3xl font-bold text-white">
                {user?.studentDetail?.xpTotal ?? 0}
              </p>
              <p className="text-xs text-indigo-300">
                Level {user?.studentDetail?.level ?? 1}
              </p>
            </div>
          </div>
        </div>

        {/* What's included */}
        <div className="px-6 py-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            What gets included
          </p>

          <div className="flex flex-col gap-2">
            {RESUME_SECTIONS.map((s) => (
              <div key={s.label} className="flex items-start gap-2.5">
                <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                  s.always ? 'bg-green-100' : 'bg-amber-50'
                }`}>
                  {s.always ? (
                    <svg className="w-2.5 h-2.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-2.5 h-2.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
                    </svg>
                  )}
                </div>
                <p className="text-sm text-gray-600">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
            <p className="text-xs text-amber-700">
              Items marked with an info icon are included only if you have enabled
              visibility in your Profile settings.
            </p>
          </div>
        </div>

        {/* Download button */}
        <div className="px-6 pb-6">
          <Button
            variant="primary"
            loading={loading}
            onClick={() => handleDownload()}
            className="w-full justify-center"
          >
            {loading ? 'Generating PDF...' : 'Download Resume as PDF'}
          </Button>

          <p className="text-xs text-center text-gray-400 mt-3">
            The PDF is generated fresh each time with your latest data.
          </p>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-5 bg-white border border-gray-100 rounded-xl px-5 py-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Tips to improve your resume
        </p>
        <div className="flex flex-col gap-2.5">
          {[
            { tip: 'Complete your profile bio and enable CGPA visibility in Profile settings', to: '/profile' },
            { tip: 'Earn more certificates by attending events and getting them issued by faculty', to: '/certificates' },
            { tip: 'Join clubs and take on leadership roles to show on your resume', to: '/clubs' },
            { tip: 'Vote in elections, submit proposals, and attend events to gain XP and badges', to: '/events' },
            { tip: 'Request and complete a mentorship for an extra line on your resume', to: '/mentorship' },
          ].map((item) => (
            <div key={item.tip} className="flex items-start gap-2.5">
              <div className="mt-0.5 w-1 h-1 rounded-full bg-indigo-400 shrink-0 mt-2" />
              <p className="text-sm text-gray-600">{item.tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Admin section — generate for any student */}
      {isAdmin && (
        <div className="mt-5 bg-white border border-gray-100 rounded-xl px-5 py-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
            Admin — generate for a student
          </p>
          <p className="text-xs text-gray-400 mb-4">
            Enter a student user ID to generate their resume
          </p>
          <AdminResumeGenerator onGenerate={handleDownload} loading={loading} />
        </div>
      )}
    </div>
  );
}

// ── Admin sub-component ───────────────────────────────────────────────────────

function AdminResumeGenerator({ onGenerate, loading }) {
  const [userId, setUserId] = useState('');

  return (
    <div className="flex gap-3">
      <input
        type="text"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        placeholder="Paste student user UUID here"
        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
      <Button
        variant="secondary"
        loading={loading}
        disabled={!userId.trim()}
        onClick={() => onGenerate(userId.trim())}
      >
        Generate
      </Button>
    </div>
  );
}