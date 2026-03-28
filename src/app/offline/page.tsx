export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl mb-4">📡</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">You're offline</h1>
        <p className="text-gray-600">
          Please reconnect to the internet to continue learning Chinese with EzHan.
        </p>
      </div>
    </div>
  )
}
