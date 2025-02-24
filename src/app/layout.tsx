import '@app/styles/globals.css';

import { type Metadata } from 'next';

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
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
