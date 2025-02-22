import { ArrowRight } from "react-feather";
import Link from "next/link";
import ThemeToggle from "@app/components/theme";

export function MainHeader() {
  return (
    <header>
      <div className="container mx-auto my-4 max-w-xl px-4">
        <div className="flex flex-row items-center justify-between">
          <h1 className="text-2xl font-bold uppercase">Apply!</h1>

          <div className="flex flex-row gap-4">
            <ThemeToggle />

            <Link className="btn btn-outline btn-primary" href="/apply">
              <span>Apply here</span>
              <ArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
