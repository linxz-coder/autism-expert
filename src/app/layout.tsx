import './globals.css'
import type { ReactNode } from 'react'
import Head from 'next/head'  // 引入 next/head 模块

export const metadata = {
  title: 'ChatFun by 凡学子',
  description: 'Generated by 凡学子',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <Head>
        {/* 添加你的 meta 标签 */}
        <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests" />
      </Head>
      <body>{children}</body>
    </html>
  )
}
