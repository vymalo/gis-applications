'use client';

import { type PropsWithChildren, useState } from 'react';
import { Code, RefreshCw } from 'react-feather';

interface ToggleJsonProps {
  doc: any;
  refresh: () => void;
}

export function ToggleJson({
  children,
  doc,
  refresh,
}: PropsWithChildren<ToggleJsonProps>) {
  const [showJson, setShowJson] = useState(false);
  return (
    <>
      <div className='absolute top-2 right-16 flex flex-row gap-4 z-20'>
        <button
          className='btn btn-soft btn-circle btn-primary'
          onClick={refresh}>
          <RefreshCw />
        </button>
        <button
          className='btn btn-soft btn-circle btn-primary'
          onClick={() => setShowJson((prev) => !prev)}>
          <Code />
        </button>
      </div>

      {!showJson && children}
      {showJson && (
        <div className='mockup-code w-full'>
          <pre className='overflow-scroll max-h-[calc(70vh)] tracking-tight'>
            {JSON.stringify(doc, null, 4)}
          </pre>
        </div>
      )}
    </>
  );
}
