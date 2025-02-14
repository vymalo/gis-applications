import { auth } from "@app/server/auth";
import { TRPCReactProvider } from "@app/trpc/react";
import { redirect } from "next/navigation";
import { type Metadata } from "next";
import { UserRole } from "@prisma/client";

export const metadata: Metadata = {
  title: "GIS Application Management",
  description: "Internal GIS Application Management",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  if (session?.user) {
    redirect("/login");
  }

  if (session?.user.role !== UserRole.ADMIN) {
    redirect("/");
  }

  return (
    <html lang="en">
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
