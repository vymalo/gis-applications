import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export function useUpdateParams() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  return useCallback(
    (paramsVK: Record<string, string | number | null | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [name, value] of Object.entries(paramsVK)) {
        params.set(name, value as string);
      }

      router.push(pathname + '?' + params.toString());
    },
    [pathname, router, searchParams],
  );
}
