import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { getLeaderboard } from '../../api/identity';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import SectionLabel from '../../components/ui/SectionLabel';
import Empty from '../../components/ui/Empty';
import Spinner from '../../components/ui/Skeleton';

const DEPARTMENTS = [
  '', 'Computer Science', 'Information Technology',
  'Electronics', 'Electrical', 'Mechanical', 'Civil',
];

function RankBadge({ rank }) {
  const styles = {
    1: { bg: '#FFFBEB', color: '#92400E', label: '1st' },
    2: { bg: 'var(--surface-2)', color: 'var(--text-2)', label: '2nd' },
    3: { bg: '#FFF7ED', color: '#C2410C', label: '3rd' },
  };
  const s = styles[rank] ?? null;
  if (!s) return (
    <span className="w-8 text-center text-sm font-sans font-semibold"
      style={{ color: 'var(--text-4)' }}>
      {rank}
    </span>
  );
  return (
    <span
      className="w-8 h-8 flex items-center justify-center rounded-full text-xs font-sans font-bold"
      style={{ background: s.bg, color: s.color }}
    >
      {rank}
    </span>
  );
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [dept, setDept]  = useState('');
  const [year, setYear]  = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard', dept, year],
    queryFn: () => getLeaderboard({
      department: dept || undefined,
      year: year || undefined,
    }),
  });

  const entries = data?.data?.leaderboard ?? [];

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Leaderboard"
        subtitle="Top students ranked by campus XP"
      />

      {/* Filters */}
      <Card className="p-4 mb-6 flex flex-wrap gap-3">
        <div className="flex-1 min-w-36">
          <label className="block text-xs font-sans font-medium mb-1 uppercase tracking-widest"
            style={{ color: 'var(--text-4)' }}>
            Department
          </label>
          <select
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            className="w-full px-3 py-2 text-sm font-sans rounded-lg transition-all duration-150"
            style={{
              background: 'var(--white)', border: '1px solid var(--border)',
              color: dept ? 'var(--text-1)' : 'var(--text-4)', outline: 'none',
            }}
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d || 'All departments'}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-sans font-medium mb-1 uppercase tracking-widest"
            style={{ color: 'var(--text-4)' }}>
            Year
          </label>
          <div className="flex gap-1.5">
            {['', 1, 2, 3, 4].map((y) => (
              <button
                key={y}
                onClick={() => setYear(String(y))}
                className="px-3 py-2 rounded-lg text-sm font-sans transition-all duration-150"
                style={{
                  background: year === String(y) ? 'rgba(201,169,110,0.1)' : 'var(--white)',
                  border: year === String(y) ? '1px solid #C9A96E' : '1px solid var(--border)',
                  color: year === String(y) ? '#C9A96E' : 'var(--text-3)',
                  fontWeight: year === String(y) ? 600 : 400,
                }}
              >
                {y || 'All'}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {isLoading ? (
        <Spinner />
      ) : entries.length === 0 ? (
        <Empty message="No data yet" sub="Students earn XP by participating in campus activities" />
      ) : (
        <Card>
          {entries.map((entry, i) => {
            const isMe = entry.userId === user?.id;
            const name = entry.profile?.firstName
              ? `${entry.profile.firstName} ${entry.profile.lastName}`
              : entry.email;

            return (
              <div
                key={entry.userId}
                className="flex items-center gap-4 px-5 py-4 transition-colors"
                style={{
                  borderBottom: i < entries.length - 1 ? '1px solid var(--surface-2)' : 'none',
                  background: isMe ? 'rgba(201,169,110,0.04)' : 'transparent',
                }}
              >
                <RankBadge rank={i + 1} />

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-sans font-medium truncate ${isMe ? 'text-gold' : 'text-t1'}`}>
                    {name} {isMe && '(you)'}
                  </p>
                  <p className="text-xs font-sans truncate" style={{ color: 'var(--text-4)' }}>
                    {entry.department}
                    {entry.year ? ` · Year ${entry.year}` : ''}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-sans font-bold" style={{ color: '#C9A96E' }}>
                    {entry.xpTotal ?? 0}
                  </p>
                  <p className="text-xs font-sans" style={{ color: 'var(--text-4)' }}>
                    Lv {entry.level ?? 1}
                  </p>
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}