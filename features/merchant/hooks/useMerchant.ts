import { useQuery } from '@tanstack/react-query';

import { getMerchant } from '@/src/services/api';
import { merchantQueryKeys } from '@/features/merchant/queryKeys';

export function useMerchant() {
  return useQuery({
    queryKey: merchantQueryKeys.summary,
    queryFn: getMerchant,
  });
}
