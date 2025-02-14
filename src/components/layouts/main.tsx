import { type PropsWithChildren } from "react";
import { MainFooter } from "@app/components/layouts/main-footer";
import { MainHeader } from "@app/components/layouts/main-header";

export function MainLayout({ children }: PropsWithChildren) {
  return (
    <>
      <MainHeader />
      <div className="container mx-auto max-w-xl px-4">{children}</div>
      <MainFooter />
    </>
  );
}
