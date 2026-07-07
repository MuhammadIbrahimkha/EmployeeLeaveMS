export default function Pagination({ pagination, onPageChange }) {
  const { pageNumber, totalPages, pageSize, totalCount } = pagination
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
      <p>
        Showing {(pageNumber - 1) * pageSize + 1}–
        {Math.min(pageNumber * pageSize, totalCount)} of {totalCount}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(pageNumber - 1)}
          disabled={pageNumber === 1}
          className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
        >
          ← Prev
        </button>
        <span className="px-3 py-1">Page {pageNumber} of {totalPages}</span>
        <button
          onClick={() => onPageChange(pageNumber + 1)}
          disabled={pageNumber === totalPages}
          className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
        >
          Next →
        </button>
      </div>
    </div>
  )
}