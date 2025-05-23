import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog Admin - Notion-style Editor',
  description: 'Modern blog administration interface with rich text editing',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-notion bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}