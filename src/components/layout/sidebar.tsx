"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils/cn"
import { getHskMeta } from "@/lib/utils/hsk"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "⊞" },
  { href: "/writing", label: "Writing", icon: "✍" },
  { href: "/vocabulary", label: "Vocabulary", icon: "本" },
  { href: "/progress", label: "Progress", icon: "↑" },
  { href: "/settings", label: "Settings", icon: "⚙" },
]

interface SidebarProps {
  hskLevel: string
  userName?: string | null
  userImage?: string | null
}

export function Sidebar({ hskLevel, userName, userImage }: SidebarProps) {
  const pathname = usePathname()
  const hskMeta = getHskMeta(hskLevel)

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-red-600">易汉</h1>
        <p className="text-xs text-gray-500 mt-0.5">EzHan · Learn Chinese Daily</p>
      </div>

      {/* HSK Level Badge */}
      <div className="px-6 py-4 border-b border-gray-100">
        <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-sm font-medium", hskMeta.color)}>
          {hskMeta.label}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-red-50 text-red-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          {userImage ? (
            <img src={userImage} alt={userName ?? ""} className="h-8 w-8 rounded-full" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
              {userName?.[0]?.toUpperCase() ?? "U"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{userName ?? "Learner"}</p>
            <p className="text-xs text-gray-400">Guest mode</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
