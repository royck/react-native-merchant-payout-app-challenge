import { useInfiniteQuery } from '@tanstack/react-query';

import { getActivity } from '@/src/services/api';
import { merchantQueryKeys } from '@/features/merchant/queryKeys';

export function useActivity() {
  return useInfiniteQuery({
    queryKey: merchantQueryKeys.activity,
    queryFn: ({ pageParam }) => getActivity(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.next_cursor ?? undefined : undefined,
  });
}
