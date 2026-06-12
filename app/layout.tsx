import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Eisenhower Task Manager',
  description: 'Sync your tasks across devices with real-time updates',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
