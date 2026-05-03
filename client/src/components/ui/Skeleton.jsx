export function SkeletonLine({ width = 'w-full', height = 'h-4' }) {
  return <div className={`skeleton ${width} ${height}`} />;
}

export function SkeletonCard() {
  return (
    <div
      className="rounded-xl bg-white p-6"
      style={{ border: '1px solid var(--border)' }}
    >
      <SkeletonLine width="w-2/3" height="h-5" />
      <div className="mt-3 flex flex-col gap-2">
        <SkeletonLine width="w-full" height="h-3" />
        <SkeletonLine width="w-5/6" height="h-3" />
        <SkeletonLine width="w-4/6" height="h-3" />
      </div>
      <div className="mt-4">
        <SkeletonLine width="w-24" height="h-8" />
      </div>
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div
      className="rounded-xl bg-white p-5"
      style={{ border: '1px solid var(--border)' }}
    >
      <SkeletonLine width="w-1/2" height="h-3" />
      <div className="mt-3">
        <SkeletonLine width="w-16" height="h-8" />
      </div>
    </div>
  );
}

export default function Spinner({ size = 'md' }) {
  const s = size === 'sm' ? 'w-4 h-4 border' : 'w-6 h-6 border-2';
  return (
    <div className="flex justify-center items-center py-16">
      <div
        className={`${s} rounded-full animate-spin`}
        style={{
          borderColor: 'var(--border)',
          borderTopColor: '#C9A96E',
        }}
      />
    </div>
  );
}