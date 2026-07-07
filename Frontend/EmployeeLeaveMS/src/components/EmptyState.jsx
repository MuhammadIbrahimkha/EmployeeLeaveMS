export default function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
      <p className="text-5xl mb-3">{icon}</p>
      <h3 className="text-gray-700 font-semibold mb-1">{title}</h3>
      {description && <p className="text-gray-400 text-sm mb-4">{description}</p>}
      {action}
    </div>
  )
}