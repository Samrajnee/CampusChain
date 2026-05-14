import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getEvents } from '../../api/campus-ops';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import SectionLabel from '../../components/ui/SectionLabel';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import Empty from '../../components/ui/Empty';
import Spinner from '../../components/ui/Skeleton';

const ADMIN_ROLES = ['TEACHER', 'HOD', 'LAB_ASSISTANT', 'LIBRARIAN', 'PRINCIPAL', 'SUPER_ADMIN'];

function fmt(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}

function fmtTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit',
  });
}

function EventCard({ event }) {
  return (
    <Link to={`/events/${event.id}`}>
      <Card hover className="p-5 animate-fade-up">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-sm font-sans font-semibold text-t1 flex-1 leading-snug">
            {event.title}
          </h3>
          <StatusBadge status={event.status} />
        </div>

        {event.description && (
          <p className="text-sm font-sans line-clamp-2 mb-3"
            style={{ color: 'var(--text-3)' }}>
            {event.description}
          </p>
        )}

        <div className="flex flex-wrap gap-4 text-xs font-sans"
          style={{ color: 'var(--text-4)' }}>
          {event.startsAt && (
            <span>{fmt(event.startsAt)} at {fmtTime(event.startsAt)}</span>
          )}
          {event.venue && <span>{event.venue}</span>}
          {event.maxCapacity && (
            <span>{event._count?.rsvps ?? 0} / {event.maxCapacity} RSVPs</span>
          )}
        </div>
      </Card>
    </Link>
  );
}

export default function EventsPage() {
  const { user } = useAuth();
  const isAdmin = ADMIN_ROLES.includes(user?.role);

  const { data, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
  });

  const events   = data?.data?.events ?? [];
  const upcoming = events.filter((e) => e.status === 'UPCOMING');
  const ongoing  = events.filter((e) => e.status === 'ONGOING');
  const past     = events.filter((e) => ['COMPLETED', 'CANCELLED'].includes(e.status));

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Events"
        subtitle="RSVP, attend, and earn XP for participation"
        action={isAdmin && <Button variant="primary">Create event</Button>}
      />

      {isLoading ? (
        <Spinner />
      ) : events.length === 0 ? (
        <Empty message="No events scheduled" sub="Events created by faculty will appear here" />
      ) : (
        <>
          {ongoing.length > 0 && (
            <div className="mb-8">
              <SectionLabel>Happening now</SectionLabel>
              <div className="flex flex-col gap-3 stagger">
                {ongoing.map((e) => <EventCard key={e.id} event={e} />)}
              </div>
            </div>
          )}
          {upcoming.length > 0 && (
            <div className="mb-8">
              <SectionLabel>Upcoming</SectionLabel>
              <div className="flex flex-col gap-3 stagger">
                {upcoming.map((e) => <EventCard key={e.id} event={e} />)}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <SectionLabel>Past</SectionLabel>
              <div className="flex flex-col gap-3 stagger">
                {past.map((e) => <EventCard key={e.id} event={e} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}