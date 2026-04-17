import { redirect } from "next/navigation"
import { getGuestUser } from "@/lib/guest"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getGuestUser()

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
