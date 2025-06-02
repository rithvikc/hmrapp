import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-plus-jakarta-sans',
});

export const metadata: Metadata = {
  title: "LAL MedReviews - Home Medication Review System",
  description: "Professional Home Medication Review automation system for pharmacist Avishkar Lal",
  keywords: ["medication review", "pharmacy", "HMR", "patient care", "medication management"],
  authors: [{ name: "LAL MedReviews" }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body suppressHydrationWarning={true} className={`${plusJakartaSans.variable} font-sans antialiased`}>
        <AuthProvider>
          <div id="root" className="min-h-screen">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
