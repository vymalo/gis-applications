'use client';

import { useRouter } from 'next/navigation';
import { type PropsWithChildren } from 'react';
import { X } from 'react-feather';

export function Modal({ children }: PropsWithChildren) {
  const router = useRouter();
  return (
    <>
      <div className='py-4 modal modal-open backdrop-blur' role='dialog'>
        <div className='modal-box w-11/12 max-w-2xl'>
          <button
            type='button'
            className='btn btn-soft btn-circle absolute right-2 top-2 z-20'
            onClick={() => router.back()}>
            <X />
          </button>

          {children}
        </div>
      </div>
    </>
  );
}
