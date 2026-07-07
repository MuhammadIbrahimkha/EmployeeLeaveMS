export default function Spinner({ size = 'md' }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-10 w-10', lg: 'h-16 w-16' }
  return (
    <div className="flex justify-center py-10">
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizes[size]}`} />
    </div>
  )
}