import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 w-full max-w-sm text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-1">易汉</h1>
        <p className="text-sm text-gray-500 mb-8">EzHan · Learn Chinese Daily</p>

        <h2 className="text-xl font-semibold text-gray-900 mb-2">No sign-in required</h2>
        <p className="text-sm text-gray-500 mb-8">
          EzHan now runs in guest mode. Your progress is saved locally in the database.
        </p>

        <Link href="/dashboard">
          <Button variant="secondary" size="lg" className="w-full">
            Continue to dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
