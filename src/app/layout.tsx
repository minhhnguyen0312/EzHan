import type { Metadata, Viewport } from "next"
import { Noto_Sans_SC, Inter } from "next/font/google"
import "./globals.css"
import { QueryProvider } from "@/components/providers/query-provider"
import { ServiceWorkerRegister } from "@/components/providers/sw-register"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sc",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#dc2626",
}

export const metadata: Metadata = {
  title: "易汉 EzHan — Learn Chinese Daily",
  description:
    "AI-powered Chinese learning app. Daily writing practice with Claude AI feedback, and vocabulary sets tailored to your HSK level.",
  manifest: "/manifest.json",
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EzHan",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${notoSansSC.variable} font-sans antialiased bg-gray-50`}>
        <ServiceWorkerRegister />
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
