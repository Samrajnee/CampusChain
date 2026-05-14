import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getClubs, joinClub, leaveClub } from '../../api/campus-ops';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import Empty from '../../components/ui/Empty';
import Spinner from '../../components/ui/Skeleton';

export default function ClubsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['clubs'],
    queryFn: getClubs,
  });

  const clubs = data?.data?.clubs ?? [];

  const joinMut = useMutation({
    mutationFn: joinClub,
    onSuccess: () => qc.invalidateQueries(['clubs']),
  });

  const leaveMut = useMutation({
    mutationFn: leaveClub,
    onSuccess: () => qc.invalidateQueries(['clubs']),
  });

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Clubs"
        subtitle="Join clubs, take on roles, and build your campus profile"
        action={<Button variant="primary">Start a club</Button>}
      />

      {isLoading ? (
        <Spinner />
      ) : clubs.length === 0 ? (
        <Empty message="No clubs yet" sub="Be the first to start one" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
          {clubs.map((club) => {
            const isMember = club.members?.some((m) => m.userId === user?.id);
            const myRole   = club.members?.find((m) => m.userId === user?.id)?.role;

            return (
              <Card key={club.id} hover className="p-5 animate-fade-up flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <Link to={`/clubs/${club.id}`}>
                      <h3 className="text-sm font-sans font-semibold text-t1 hover:text-gold transition-colors">
                        {club.name}
                      </h3>
                    </Link>
                    {myRole && (
                      <span className="text-xs font-sans font-semibold"
                        style={{ color: '#C9A96E' }}>
                        {myRole.charAt(0) + myRole.slice(1).toLowerCase()}
                      </span>
                    )}
                  </div>
                  <StatusBadge status={club.status} />
                </div>

                {club.description && (
                  <p className="text-sm font-sans line-clamp-2"
                    style={{ color: 'var(--text-3)' }}>
                    {club.description}
                  </p>
                )}

                <div className="flex items-center justify-between mt-auto pt-2"
                  style={{ borderTop: '1px solid var(--border)' }}>
                  <p className="text-xs font-sans" style={{ color: 'var(--text-4)' }}>
                    {club._count?.members ?? 0} members
                  </p>
                  {isMember ? (
                    <Button
                      variant="ghost"
                      onClick={() => leaveMut.mutate(club.id)}
                      loading={leaveMut.isPending}
                    >
                      Leave
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() => joinMut.mutate(club.id)}
                      loading={joinMut.isPending}
                      disabled={club.status !== 'ACTIVE'}
                    >
                      Join
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}