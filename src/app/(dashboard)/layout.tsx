import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (!session.user.onboardingComplete) {
    redirect("/onboarding")
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        hskLevel={session.user.hskLevel}
        userName={session.user.name}
        userImage={session.user.image}
      />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 pb-20 md:pb-6">{children}</main>
      </div>
      <MobileNav />
    </div>
  )
}
