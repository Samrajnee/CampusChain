import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getAdminStats,
  searchStudents,
  getAuditLogs,
  getPendingItems,
} from '../../api/admin';

const ADMIN_ROLES = ['TEACHER', 'HOD', 'LAB_ASSISTANT', 'LIBRARIAN', 'PRINCIPAL', 'SUPER_ADMIN'];

const DEPARTMENTS = [
  '', 'Computer Science', 'Electronics', 'Mechanical',
  'Civil', 'Information Technology', 'Electrical',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function fmtTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

function displayName(user) {
  if (!user) return 'Unknown';
  const p = user.profile;
  if (p?.firstName) return `${p.firstName} ${p.lastName}`;
  return user.email;
}

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function Empty({ message }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-10 text-center">
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, bg }) {
  return (
    <div className={`${bg} rounded-xl px-5 py-4 flex flex-col gap-1`}>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
        {label}
      </p>
      <p className="text-2xl font-bold text-gray-900 leading-none">
        {value ?? <span className="text-gray-300">—</span>}
      </p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Section: Stats ─────────────────────────────────────────────────────────────

function StatsSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getAdminStats,
    staleTime: 30_000,
  });

  const s = data?.data;

  if (isLoading) return <Spinner />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          People
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Students" value={s?.totalStudents} bg="bg-violet-50" />
          <StatCard label="Faculty" value={s?.totalFaculty} bg="bg-sky-50" />
          <StatCard label="Active clubs" value={s?.totalClubs} bg="bg-teal-50" />
          <StatCard label="Certificates" value={s?.totalCertificates} bg="bg-amber-50" />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Activity
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Elections" value={s?.totalElections} sub={`${s?.openElections ?? 0} open`} bg="bg-blue-50" />
          <StatCard label="Proposals" value={s?.totalProposals} bg="bg-pink-50" />
          <StatCard label="Events" value={s?.totalEvents} bg="bg-green-50" />
          <StatCard label="Grievances" value={s?.totalGrievances} sub={`${s?.resolvedGrievances ?? 0} resolved`} bg="bg-rose-50" />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Pending action
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Budget requests" value={s?.pendingBudget} bg="bg-orange-50" />
          <StatCard label="Club approvals" value={s?.pendingClubs} bg="bg-fuchsia-50" />
        </div>
      </div>
    </div>
  );
}

// ── Section: Student Search ────────────────────────────────────────────────────

function StudentsSection() {
  const [filters, setFilters] = useState({ search: '', department: '', year: '' });
  const [applied, setApplied] = useState({});
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-students', applied, page],
    queryFn: () =>
      searchStudents({
        ...(applied.search && { search: applied.search }),
        ...(applied.department && { department: applied.department }),
        ...(applied.year && { year: applied.year }),
        page,
        limit: 15,
      }),
    keepPreviousData: true,
  });

  const students = data?.data?.students ?? [];
  const pagination = data?.data?.pagination;

  const handleSearch = () => {
    setApplied({ ...filters });
    setPage(1);
  };

  const handleClear = () => {
    setFilters({ search: '', department: '', year: '' });
    setApplied({});
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-40">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Name, email or student ID
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Department
          </label>
          <select
            value={filters.department}
            onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d || 'All departments'}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Year
          </label>
          <select
            value={filters.year}
            onChange={(e) => setFilters((f) => ({ ...f, year: e.target.value }))}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">All years</option>
            {[1, 2, 3, 4, 5, 6].map((y) => (
              <option key={y} value={y}>Year {y}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Search
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 text-sm border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <Spinner />
      ) : students.length === 0 ? (
        <Empty message="No students found" />
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Student
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  ID
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Department
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Year
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  XP
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr
                  key={s.id}
                  className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    i === students.length - 1 ? 'border-b-0' : ''
                  }`}
                >
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">{displayName(s)}</p>
                    <p className="text-xs text-gray-400">{s.email}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-500 font-mono text-xs">
                    {s.studentDetail?.studentId || '—'}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {s.studentDetail?.department || '—'}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {s.studentDetail?.year ? `Year ${s.studentDetail.year}` : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-indigo-600 font-semibold">
                      {s.studentDetail?.xpTotal ?? 0}
                    </span>
                    <span className="text-xs text-gray-400 ml-1">
                      Lv {s.studentDetail?.level ?? 1}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {fmt(s.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Table pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                {pagination.total} students total
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 text-xs text-gray-500">
                  {page} / {pagination.totalPages}
                </span>
                <button
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Section: Pending Items ─────────────────────────────────────────────────────

function PendingSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-pending'],
    queryFn: getPendingItems,
    staleTime: 15_000,
  });

  const pending = data?.data;

  if (isLoading) return <Spinner />;

  const budgets = pending?.budgetRequests ?? [];
  const clubs = pending?.pendingClubs ?? [];
  const grievances = pending?.openGrievances ?? [];

  const grievanceColor = {
    SUBMITTED: 'bg-sky-50 text-sky-600',
    UNDER_REVIEW: 'bg-amber-50 text-amber-600',
    ESCALATED: 'bg-red-50 text-red-600',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Budget requests */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Budget requests
        </p>
        {budgets.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-xl p-6 text-center">
            <p className="text-xs text-gray-400">No pending requests</p>
          </div>
        ) : (
          budgets.map((b) => (
            <div key={b.id} className="bg-white border border-gray-100 rounded-xl p-4">
              <p className="text-sm font-medium text-gray-900 truncate">{b.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{b.club?.name}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-semibold text-indigo-600">
                  Rs {Number(b.amount).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-gray-400">{fmt(b.createdAt)}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                by {displayName(b.requester)}
              </p>
              <Link
                to="/clubs"
                className="block mt-3 text-center text-xs text-indigo-500 hover:text-indigo-700 border border-indigo-100 rounded-lg py-1.5 transition-colors"
              >
                Review in Clubs
              </Link>
            </div>
          ))
        )}
      </div>

      {/* Club approvals */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Club approvals
        </p>
        {clubs.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-xl p-6 text-center">
            <p className="text-xs text-gray-400">No clubs pending approval</p>
          </div>
        ) : (
          clubs.map((c) => {
            const president = c.members?.[0];
            return (
              <div key={c.id} className="bg-white border border-gray-100 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{c.description}</p>
                {president && (
                  <p className="text-xs text-gray-400 mt-2">
                    President: {displayName(president.user)}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">{fmt(c.createdAt)}</p>
                <Link
                  to="/clubs"
                  className="block mt-3 text-center text-xs text-indigo-500 hover:text-indigo-700 border border-indigo-100 rounded-lg py-1.5 transition-colors"
                >
                  Review in Clubs
                </Link>
              </div>
            );
          })
        )}
      </div>

      {/* Open grievances */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Open grievances
        </p>
        {grievances.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-xl p-6 text-center">
            <p className="text-xs text-gray-400">No open grievances</p>
          </div>
        ) : (
          grievances.map((g) => (
            <div key={g.id} className="bg-white border border-gray-100 rounded-xl p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-gray-900 truncate flex-1">
                  {g.title}
                </p>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                    grievanceColor[g.status] ?? 'bg-gray-50 text-gray-500'
                  }`}
                >
                  {g.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {g.isAnonymous ? 'Anonymous' : displayName(g.student)}
              </p>
              <p className="text-xs text-gray-400">{fmt(g.createdAt)}</p>
              <Link
                to="/grievances"
                className="block mt-3 text-center text-xs text-indigo-500 hover:text-indigo-700 border border-indigo-100 rounded-lg py-1.5 transition-colors"
              >
                Review in Grievances
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Section: Audit Log ─────────────────────────────────────────────────────────

function AuditSection() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit', page],
    queryFn: () => getAuditLogs({ page, limit: 20 }),
    keepPreviousData: true,
  });

  const logs = data?.data?.logs ?? [];
  const pagination = data?.data?.pagination;

  const actionColor = (action) => {
    if (action.includes('DELETED') || action.includes('REVOKED') || action.includes('REJECTED')) {
      return 'bg-red-50 text-red-500';
    }
    if (action.includes('CREATED') || action.includes('ISSUED') || action.includes('APPROVED')) {
      return 'bg-green-50 text-green-600';
    }
    if (action.includes('UPDATED') || action.includes('STATUS') || action.includes('OPENED')) {
      return 'bg-amber-50 text-amber-600';
    }
    return 'bg-gray-50 text-gray-500';
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="flex flex-col gap-3">
      {logs.length === 0 ? (
        <Empty message="No audit logs yet" />
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Action
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Actor
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Target
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr
                  key={log.id}
                  className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${
                    i === logs.length - 1 ? 'border-b-0' : ''
                  }`}
                >
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block text-xs font-medium px-2 py-1 rounded-lg ${actionColor(log.action)}`}
                    >
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-gray-700 font-medium">{displayName(log.actor)}</p>
                    <p className="text-xs text-gray-400">{log.actor?.role}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-gray-500 text-xs font-mono">
                      {log.targetType}
                    </p>
                    <p className="text-xs text-gray-400 font-mono truncate max-w-32">
                      {log.targetId}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400">
                    {fmtTime(log.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                {pagination.total} log entries total
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 text-xs text-gray-500">
                  {page} / {pagination.totalPages}
                </span>
                <button
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'students', label: 'Students' },
  { key: 'pending', label: 'Pending' },
  { key: 'audit', label: 'Audit Log' },
];

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');

  const isAdmin = ADMIN_ROLES.includes(user?.role);

  if (!isAdmin) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
        <p className="text-sm text-gray-400">
          You do not have permission to access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Platform overview, student directory, and pending approvals
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm rounded-lg transition-colors font-medium ${
              tab === t.key
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && <StatsSection />}
      {tab === 'students' && <StudentsSection />}
      {tab === 'pending' && <PendingSection />}
      {tab === 'audit' && <AuditSection />}
    </div>
  );
}