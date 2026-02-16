import type { Metadata } from 'next';
import ThemeProvider from '@/providers/ThemeProvider';
import { ubuntu } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'HitX',
  description:
    'Connect your X account, explore your posts as floating cards, and search them instantly in one fast single-page experience.',
  applicationName: 'HitX',
  generator: 'Next.js',
  keywords: ['HitX', 'X posts search', 'Next.js 16', 'React 19', 'TailwindCSS', 'OAuth 2.0'],
  authors: [{ name: 'Mohit Das' }],
  creator: 'Mohit Das',
  publisher: 'HitX',
  other: {
    version: '0.1.0',
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