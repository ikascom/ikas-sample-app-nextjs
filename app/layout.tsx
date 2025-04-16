import { ReactNode } from 'react';
import type { Metadata } from 'next';
import './globals.scss';

export const metadata: Metadata = {
  title: 'My Awesome ikas App',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
