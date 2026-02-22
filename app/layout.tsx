import type { Metadata, Viewport } from 'next'
import { Noto_Sans_KR, Noto_Serif_KR } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const notoSans = Noto_Sans_KR({
  subsets: ['latin'],
  variable: '--font-noto-sans',
  weight: ['300', '400', '500', '700'],
})

const notoSerif = Noto_Serif_KR({
  subsets: ['latin'],
  variable: '--font-noto-serif',
  weight: ['400', '600'],
})

export const metadata: Metadata = {
  title: '마음쉼터 - 감정 기반 위로 플랫폼',
  description: '당신의 감정에 맞는 따뜻한 위로와 공감을 나누는 공간입니다.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#e8ddd4',
  width: 'device-width',
  initialScale: 1,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={`${notoSans.variable} ${notoSerif.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
