'use client';

import { type PropsWithChildren, useState } from 'react';
import { Code } from 'react-feather';

interface ToggleJsonProps {
  doc: any;
}

export function ToggleJson({
  children,
  doc,
}: PropsWithChildren<ToggleJsonProps>) {
  const [showJson, setShowJson] = useState(false);
  return (
    <>
      <div className='absolute top-2 right-16'>
        <button
          className='btn btn-soft btn-circle btn-primary'
          onClick={() => setShowJson((prev) => !prev)}>
          <Code />
        </button>
      </div>
      
      {!showJson && children}
      {showJson && (
        <pre className='bg-base-200 overflow-scroll rounded-2xl tracking-tight'>
          {JSON.stringify(doc, null, 4)}
        </pre>
      )}
    </>
  );
}
