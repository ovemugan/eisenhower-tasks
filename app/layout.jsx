export const metadata = {
  title: 'Eisenhower Task Manager',
  description: 'Sync your tasks across devices with real-time updates',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
