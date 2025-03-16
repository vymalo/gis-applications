'use client';

import { useCallback, useMemo } from 'react';
import { Copy, Share2 } from 'react-feather';

export function CopyCurrentUrl() {
  const url = useMemo(() => {
    const { origin } = window.location;
    return `${origin}/apply`;
  }, []);

  const copyUrl = useCallback(async () => {
    await navigator.clipboard.writeText(url).catch(console.warn);
  }, [url]);

  const shareUrl = useCallback(async () => {
    await navigator
      .share({
        url: url,
        title: 'Apply for GIS',
        text: 'Use this link to apply for the Adorsys GIS training Center Cameroon',
      })
      .catch(console.warn);
  }, [url]);

  return (
    <div className='join w-full'>
      <label className='input validator w-full join-item'>
        <input
          readOnly
          value={url}
          type='email'
          required
          className='tracking-tight'
        />
      </label>

      <button
        type='button'
        onClick={copyUrl}
        className='btn btn-soft btn-primary join-item'>
        <Copy />
      </button>

      <button
        type='button'
        onClick={shareUrl}
        className='btn btn-soft btn-primary join-item'>
        <Share2 />
      </button>
    </div>
  );
}
