'use client';

import { api } from '@app/trpc/react';
import Image, { type ImageProps } from 'next/image';

type SignedImageProps = Omit<ImageProps, 'src'> & {
  publicUrl: string;
};

export function SignedImage({
  publicUrl,
  alt,
  ...rest
}: SignedImageProps) {
  const { data, isLoading } = api.upload.getViewUrl.useQuery({
    publicUrl,
  });

  if (isLoading || !data?.url) {
    return (
      <div className='skeleton w-full h-full min-h-12 rounded-lg' />
    );
  }

  return <Image priority {...rest} src={data.url} alt={alt} />;
}
