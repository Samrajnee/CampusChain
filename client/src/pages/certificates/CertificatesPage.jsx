import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { getCertificates } from '../../api/identity';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import SectionLabel from '../../components/ui/SectionLabel';
import StatusBadge from '../../components/ui/StatusBadge';
import Empty from '../../components/ui/Empty';
import Spinner from '../../components/ui/Skeleton';

const TYPE_STYLE = {
  PARTICIPATION: { bg: '#EEF2FF', color: '#4338CA' },
  ACHIEVEMENT:   { bg: '#FFFBEB', color: '#92400E' },
  LEADERSHIP:    { bg: '#F0FDF4', color: '#15803D' },
  ACADEMIC:      { bg: '#EFF6FF', color: '#1D4ED8' },
  CUSTOM:        { bg: 'var(--surface-2)', color: 'var(--text-3)' },
};

function fmt(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function CertificatesPage() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['certificates'],
    queryFn: getCertificates,
  });

  const certificates = data?.data?.certificates ?? [];

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Certificates"
        subtitle="Your verified achievements and participation records"
      />

      {isLoading ? (
        <Spinner />
      ) : certificates.length === 0 ? (
        <Empty
          message="No certificates yet"
          sub="Certificates issued by faculty will appear here"
        />
      ) : (
        <div className="flex flex-col gap-3 stagger">
          {certificates.map((cert) => {
            const ts = TYPE_STYLE[cert.type] ?? TYPE_STYLE.CUSTOM;
            const typeLabel = cert.type.charAt(0) + cert.type.slice(1).toLowerCase();

            return (
              <Card key={cert.id} className="p-5 animate-fade-up">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className="text-xs font-sans font-semibold px-2.5 py-0.5 rounded-full"
                        style={{ background: ts.bg, color: ts.color }}
                      >
                        {typeLabel}
                      </span>
                      {cert.isRevoked && (
                        <span className="text-xs font-sans font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: '#FEF2F2', color: '#DC2626' }}>
                          Revoked
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-sans font-semibold text-t1 mb-1">
                      {cert.title}
                    </h3>
                    <p className="text-xs font-sans" style={{ color: 'var(--text-3)' }}>
                      Issued by {cert.issuedBy}
                    </p>
                    {cert.description && (
                      <p className="text-sm font-sans mt-2 line-clamp-2"
                        style={{ color: 'var(--text-3)' }}>
                        {cert.description}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-sans" style={{ color: 'var(--text-4)' }}>
                      {fmt(cert.createdAt)}
                    </p>
                    <a
                      href={`/verify/${cert.uniqueCode}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-2 text-xs font-sans font-semibold transition-colors"
                      style={{ color: '#C9A96E' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#B8934A')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#C9A96E')}
                    >
                      Verify
                    </a>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}