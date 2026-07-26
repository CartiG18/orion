import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ORION — Planetary Monitoring Dashboard',
  description:
    'Retro-futurist orbital monitoring terminal. Real-time planetary telemetry and satellite tracking.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
