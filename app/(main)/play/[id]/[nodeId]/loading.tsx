export default function ReaderLoading() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10 animate-pulse">
      {/* Nav bar skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-4 w-16 bg-gray-200 rounded" />
          <div className="h-4 w-10 bg-gray-200 rounded" />
        </div>
        <div className="h-4 w-20 bg-gray-200 rounded" />
      </div>

      {/* Scene image placeholder */}
      <div className="w-full h-56 bg-gray-200 rounded-2xl mb-6" />

      {/* Title */}
      <div className="h-7 w-2/3 bg-gray-200 rounded mb-4" />

      {/* Content lines */}
      <div className="space-y-3 mb-10">
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-5/6 bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-3/4 bg-gray-200 rounded" />
      </div>

      {/* Choices label */}
      <div className="h-4 w-28 bg-gray-200 rounded mb-3" />

      {/* Choice buttons */}
      <div className="flex flex-col gap-3">
        {[0, 1, 2].map(i => (
          <div key={i} className="h-14 w-full bg-gray-200 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
