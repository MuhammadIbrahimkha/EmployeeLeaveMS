export default function Alert({ type = 'error', message }) {
  if (!message) return null

  const styles = {
    error: 'bg-red-50 border-red-300 text-red-700',
    success: 'bg-green-50 border-green-300 text-green-700',
    warning: 'bg-yellow-50 border-yellow-300 text-yellow-700',
  }

  return (
    <div className={`px-4 py-3 rounded-lg border text-sm ${styles[type]}`}>
      {message}
    </div>
  )
}