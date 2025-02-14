import { ArrowRight } from "react-feather";
import Link from "next/link";

export function MainHeader() {
  return (
    <header>
      <div className="container mx-auto max-w-xl px-4 my-4">
        <div className="flex flex-row justify-between">
          <h1 className="text-2xl font-bold">GIS Application</h1>

          <div>
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
