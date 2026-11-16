import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createPayout } from '@/src/services/api';
import { merchantQueryKeys } from '@/features/merchant/queryKeys';

export function useCreatePayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPayout,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: merchantQueryKeys.summary });
    },
  });
}
