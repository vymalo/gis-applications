import Link from 'next/link';
import { Home } from 'react-feather';

export function MainFooter() {
  return (
    <footer className='footer container mx-auto mt-4 max-w-xl px-4'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
        <Link
          href='/'
          className='link link-primary flex flex-row items-center gap-2'>
          <Home />
          <span className='md:hidden'>Home</span>
        </Link>
        <Link href='/res/faq' className='link link-primary'>
          <span>FAQ</span>
        </Link>
        <Link href='/res/tos' className='link link-primary'>
          <span>Terms of Service</span>
        </Link>
        <Link href='/res/contact' className='link link-primary'>
          <span>Contact</span>
        </Link>
        <Link href='/res/privacy' className='link link-primary'>
          <span>Privacy policy</span>
        </Link>
      </div>
    </footer>
  );
}
