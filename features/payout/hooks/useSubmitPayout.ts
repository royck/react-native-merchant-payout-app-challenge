import { getDeviceId, isBiometricAuthenticated } from '@/modules/screen-security/screen-security';
import { useCreatePayout } from '@/features/payout/hooks/useCreatePayout';
import {
  submitPayout,
  type SubmitPayoutDependencies,
} from '@/features/payout/services/submitPayout';

type SubmissionCallbacks = Pick<
  SubmitPayoutDependencies,
  'onBiometricRequired' | 'onSubmitting'
>;

export function useSubmitPayout() {
  const payoutMutation = useCreatePayout();

  return (draft: Parameters<typeof submitPayout>[0], callbacks?: SubmissionCallbacks) =>
    submitPayout(draft, {
      isBiometricAuthenticated,
      getDeviceId,
      createPayout: payoutMutation.mutateAsync,
      ...callbacks,
    });
}
