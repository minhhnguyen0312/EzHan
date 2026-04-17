import { redirect } from "next/navigation"
import { requireUserForPage } from "@/lib/session"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"

// Dashboard pages all depend on the authenticated user and DB, so they
// must render per-request rather than being prerendered at build time.
export const dynamic = "force-dynamic"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUserForPage()

  if (!user.onboardingComplete) {
    redirect("/onboarding")
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        hskLevel={user.hskLevel}
        userName={user.name}
        userImage={user.image}
      />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 pb-20 md:pb-6">{children}</main>
      </div>
      <MobileNav />
    </div>
  )
}
