import '@app/styles/globals.css';

import { type Metadata } from 'next';

import { ThemeProvider } from '@app/components/theme';
import { TRPCReactProvider } from '@app/trpc/react';

export const metadata: Metadata = {
  title: 'GIS Application Management',
  description: 'Apply for GIS',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='en'>
      <body className='bg-base-100'>
        <ThemeProvider>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
