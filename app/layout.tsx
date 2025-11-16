import type { Metadata } from 'next';
import ThemeProvider from '@/providers/ThemeProvider';
import { ubuntu } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Minimal Theme Starter – Next.js Multi-Theme Template',
  description:
    'A lightweight, production-ready Next.js starter template with multi-theme support, Zustand state management, and TailwindCSS styling. Built for fast UI development and clean architecture.',
  applicationName: 'minimal-theme-starter',
  generator: 'Next.js',
  keywords: [
    'Next.js starter',
    'Next.js theme template',
    'Next.js multi theme',
    'TailwindCSS template',
    'Zustand state management',
    'Next.js boilerplate',
    'light dark theme',
    'React UI starter',
    'frontend starter template',
  ],
  authors: [{ name: 'Mohit Das' }],
  creator: 'Mohit Das',
  publisher: 'minimal-theme-starter',
  other: {
    version: '1.0.0',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ubuntu.variable} antialiased`}
      suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
