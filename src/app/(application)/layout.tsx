import "@app/styles/globals.css";

import { type Metadata } from "next";

import { TRPCReactProvider } from "@app/trpc/react";
import Link from "next/link";
import { ArrowLeft } from "react-feather";

export const metadata: Metadata = {
  title: "Apply for GIS",
  description: "Apply for GIS",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <TRPCReactProvider>
          <div className="container mx-auto max-w-xl p-4">
            <div className="mb-2 md:mb-4">
              <Link href="/" className="btn btn-ghost">
                <ArrowLeft className="text-primary" />
                <span className="text-primary">Home</span>
              </Link>
            </div>
            {children}
          </div>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
