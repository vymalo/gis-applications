import baseConfig from 'eslint-config-next';

export default [
  ...baseConfig,
  {
    ignores: ['drizzle/**', 'public/**', 'dist/**', '.yarn/**', '.next/**'],
  },
];
