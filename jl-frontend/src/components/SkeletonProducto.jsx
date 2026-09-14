function SkeletonProducto() {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col animate-pulse">
      <div className="h-40 bg-gray-200 rounded mb-3"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-6 bg-gray-200 rounded w-1/3 mt-auto"></div>
    </div>
  )
}

export default SkeletonProducto