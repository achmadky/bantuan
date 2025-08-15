import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: "Bantuan-kita - Temukan Bantuan yang Anda Butuhkan",
  description: "Platform untuk menghubungkan orang yang membutuhkan bantuan dengan mereka yang bisa membantu",
  generator: "v0.dev",
  icons: {
    icon: "/bantuan-kita-logo.svg",
    apple: "/bantuan-kita-logo.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className={GeistSans.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
