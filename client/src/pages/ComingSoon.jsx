export default function ComingSoon({ title }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-64 text-center">
      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
        <span className="text-gray-400 text-xs font-semibold uppercase">Soon</span>
      </div>
      <h2 className="text-base font-semibold text-gray-700 mb-1">{title}</h2>
      <p className="text-sm text-gray-400">This section is currently being built.</p>
    </div>
  )
}