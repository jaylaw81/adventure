export default function StoryLandingLoading() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 animate-pulse">
      {/* Back link */}
      <div className="h-4 w-12 bg-gray-200 rounded mb-10" />

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        {/* Cover image placeholder */}
        <div className="w-full h-56 bg-gray-200" />

        <div className="p-8">
          {/* Title row */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="h-8 w-2/3 bg-gray-200 rounded" />
            <div className="h-6 w-20 bg-gray-200 rounded-full shrink-0" />
          </div>

          {/* Description */}
          <div className="space-y-2 mb-5">
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-4 w-4/5 bg-gray-200 rounded" />
          </div>

          {/* Tags */}
          <div className="flex gap-2 mb-6">
            <div className="h-6 w-16 bg-gray-200 rounded-full" />
            <div className="h-6 w-20 bg-gray-200 rounded-full" />
            <div className="h-6 w-14 bg-gray-200 rounded-full" />
          </div>

          {/* CTA button */}
          <div className="h-12 w-44 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
