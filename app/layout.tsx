import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import AppLayout from "@/components/layout/AppLayout"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "AI设计评审实验室 — 专业设计作品评审平台",
  description:
    "上传你的设计作品或作品集，获取 AI 驱动的多维度专业评审。覆盖作品评审、作品集审阅与求职分析，从设计学生到专业设计师的成长伙伴。",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#0A0A0A] text-white">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  )
}
