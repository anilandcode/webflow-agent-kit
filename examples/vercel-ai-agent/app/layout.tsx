import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Webflow Agent — Blog Manager',
  description: 'AI agent managing a Webflow CMS blog through natural language',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
