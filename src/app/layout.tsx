import '@app/styles/globals.css';

import { type Metadata } from 'next';

import { ThemeProvider } from '@app/components/theme';
import { TRPCReactProvider } from '@app/trpc/react';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

export const metadata: Metadata = {
  title: 'GIS Application Management',
  description: 'Apply for GIS',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
    <body className="bg-base-100">
    <NuqsAdapter>
      <ThemeProvider>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </ThemeProvider>
    </NuqsAdapter>
    </body>
    </html>
  );
}
