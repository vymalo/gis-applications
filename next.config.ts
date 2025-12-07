import withPlugins from 'next-compose-plugins';
import type { NextConfig } from 'next';

import { env } from '@app/env';

const isDev = env.NODE_ENV !== 'production';

const withImageSizes = (nextConfig: NextConfig): NextConfig => {
  if (isDev) {
    return {
      ...nextConfig,
      images: {
        ...nextConfig.images,
        remotePatterns: [
          ...(nextConfig?.images?.remotePatterns ?? []),
          {
            hostname: '*',
          },
        ],
      },
    };
  }
  return {
    ...nextConfig,
    images: {
      ...nextConfig.images,
      remotePatterns: [
        ...(nextConfig?.images?.remotePatterns ?? []),
        {
          protocol: 'https',
          hostname: '*.vymalo.com',
        },
        {
          protocol: 'https',
          hostname: '*.ssegning.me',
        },
      ],
    },
  };
};

const withWebpack = (nextConfig: NextConfig): NextConfig => {
  return {
    ...nextConfig,
    webpack: (config, context) => {
      config.optimization.splitChunks = {
        chunks: 'all',
      };
      return nextConfig.webpack ? nextConfig.webpack(config, context) : config;
    },
  };
};

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
};

export default withPlugins(
  [
    [withImageSizes],
  ],
  nextConfig,
);
