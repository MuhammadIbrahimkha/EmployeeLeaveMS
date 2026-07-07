const STYLES = {
  Pending:  'bg-yellow-100 text-yellow-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
  Active:   'bg-green-100 text-green-700',
  Inactive: 'bg-gray-100 text-gray-500',
  Admin:    'bg-purple-100 text-purple-700',
  Manager:  'bg-blue-100 text-blue-700',
  Employee: 'bg-green-100 text-green-700',
}

export default function StatusBadge({ label }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STYLES[label] || 'bg-gray-100 text-gray-600'}`}>
      {label}
    </span>
  )
}