import ThemeToggle from '@app/components/theme';
import Link from 'next/link';
import { ArrowRight } from 'react-feather';

export function MainHeader() {
  return (
    <header>
      <div className='container mx-auto my-4 max-w-xl px-4'>
        <div className='flex flex-row items-center justify-between'>
          <h1 className='app-title'>
            Apply!
          </h1>

          <div className='flex flex-row gap-4'>
            <ThemeToggle />

            <Link className='btn btn-outline btn-primary' href='/apply'>
              <span>Apply here</span>
              <ArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
