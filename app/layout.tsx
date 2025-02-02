import '@/styles/globals.css'

export const metadata = {
  title: 'Quit Snus App',
  description: 'Track your snus usage and quit smoking',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
