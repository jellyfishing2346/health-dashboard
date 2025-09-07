import './globals.css';
import React from 'react';
import { Providers } from './providers';

export const metadata = {
  title: 'Health Tracker',
  description: 'Full-stack health tracker',
  icons: {
    icon: '/health-tracker.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Removed duplicate brand header; Header component renders the app header */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
