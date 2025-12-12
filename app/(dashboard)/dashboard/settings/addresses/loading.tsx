export default function AddressesLoading() {
  return (
    <div className="max-w-2xl mx-auto animate-pulse">
      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
      <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
      
      <div className="flex gap-2 mb-6">
        <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="h-10 w-44 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
      
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
