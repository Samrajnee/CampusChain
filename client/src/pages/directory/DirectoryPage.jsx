import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDirectory } from '../../api/identity';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Empty from '../../components/ui/Empty';
import Spinner from '../../components/ui/Skeleton';

const DEPARTMENTS = [
  '', 'Computer Science', 'Information Technology',
  'Electronics', 'Electrical', 'Mechanical', 'Civil',
];

export default function DirectoryPage() {
  const [filters, setFilters] = useState({ search: '', department: '', year: '' });
  const [applied, setApplied] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ['directory', applied],
    queryFn: () => getDirectory(applied),
  });

  const students = data?.data?.students ?? [];

  function handleSearch() { setApplied({ ...filters }); }
  function handleClear()  { setFilters({ search: '', department: '', year: '' }); setApplied({}); }

  const inputStyle = {
    background: 'var(--white)', border: '1px solid var(--border)',
    color: 'var(--text-1)', outline: 'none',
    boxShadow: '0 1px 2px rgba(11,17,32,0.04)',
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Student Directory"
        subtitle="Find and connect with fellow students"
      />

      {/* Search bar */}
      <Card className="p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-48">
          <label className="block text-xs font-sans font-medium mb-1.5 uppercase tracking-widest"
            style={{ color: 'var(--text-4)' }}>
            Search
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Name or student ID"
            className="w-full px-4 py-2.5 text-sm font-sans rounded-lg transition-all duration-150"
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#C9A96E';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,169,110,0.2)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(11,17,32,0.04)';
            }}
          />
        </div>

        <div>
          <label className="block text-xs font-sans font-medium mb-1.5 uppercase tracking-widest"
            style={{ color: 'var(--text-4)' }}>
            Department
          </label>
          <select
            value={filters.department}
            onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))}
            className="px-4 py-2.5 text-sm font-sans rounded-lg transition-all duration-150"
            style={inputStyle}
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d || 'All departments'}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-sans font-medium mb-1.5 uppercase tracking-widest"
            style={{ color: 'var(--text-4)' }}>
            Year
          </label>
          <select
            value={filters.year}
            onChange={(e) => setFilters((f) => ({ ...f, year: e.target.value }))}
            className="px-4 py-2.5 text-sm font-sans rounded-lg transition-all duration-150"
            style={inputStyle}
          >
            <option value="">All years</option>
            {[1,2,3,4].map((y) => <option key={y} value={y}>Year {y}</option>)}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            className="px-5 py-2.5 rounded-lg text-sm font-sans font-semibold text-white transition-all duration-150"
            style={{ background: 'linear-gradient(135deg, #C9A96E, #B8934A)' }}
          >
            Search
          </button>
          <button
            onClick={handleClear}
            className="px-5 py-2.5 rounded-lg text-sm font-sans transition-all duration-150"
            style={{
              background: 'var(--white)', border: '1px solid var(--border)',
              color: 'var(--text-3)',
            }}
          >
            Clear
          </button>
        </div>
      </Card>

      {/* Results */}
      {isLoading ? (
        <Spinner />
      ) : students.length === 0 ? (
        <Empty message="No students found" sub="Try adjusting your filters" />
      ) : (
        <Card>
          {students.map((s, i) => {
            const name = s.profile?.firstName
              ? `${s.profile.firstName} ${s.profile.lastName}`
              : s.email;
            return (
              <div
                key={s.id}
                className="flex items-center gap-4 px-5 py-4"
                style={{
                  borderBottom: i < students.length - 1 ? '1px solid var(--surface-2)' : 'none',
                }}
              >
                {/* Avatar placeholder */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-sans font-semibold"
                  style={{ background: 'var(--surface-2)', color: 'var(--text-3)' }}
                >
                  {name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-sans font-medium text-t1 truncate">{name}</p>
                  <p className="text-xs font-sans truncate" style={{ color: 'var(--text-4)' }}>
                    {s.studentDetail?.department}
                    {s.studentDetail?.year ? ` · Year ${s.studentDetail.year}` : ''}
                  </p>
                </div>

                {s.studentDetail?.studentId && (
                  <p className="text-xs font-mono" style={{ color: 'var(--text-4)' }}>
                    {s.studentDetail.studentId}
                  </p>
                )}
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}