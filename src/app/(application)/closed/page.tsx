import Link from 'next/link';

export default async function ClosedPage() {
  return (
    <main className='flex flex-col gap-4'>
      <h1 className='app-title md:col-span-2'>Application closed!</h1>
      <p>We thank you for applying! Right now application are closed!</p>

      <p className='md:col-span-2'>
        If any question, please review the{' '}
        <Link target='_blank' rel='canonical' href='/res/faq' className='link link-primary'>
          FAQ
        </Link>{' '}
        page.
      </p>
    </main>
  );
}
