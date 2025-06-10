import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter, Instrument_Serif } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import ErrorBoundary from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const instrumentSerif = Instrument_Serif({ 
  subsets: ['latin'], 
  weight: ['400'], 
  variable: '--font-instrument-serif' 
})

export const metadata: Metadata = {
  title: 'myHMR - Streamlined Home Medication Reviews',
  description: 'Save hours on every HMR with intelligent automation designed for Australian pharmacists. Professional AI-powered platform at myHMR.ai',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body suppressHydrationWarning={true} className={`${inter.variable} ${instrumentSerif.variable} ${inter.className}`}>
        <ErrorBoundary>
          <AuthProvider>
            <div id="root" className="min-h-screen">
              {children}
            </div>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
