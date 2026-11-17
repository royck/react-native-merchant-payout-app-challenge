import { useRef } from 'react';

import { mapPayoutError } from '@/features/payout/errors';
import { usePayoutFlow } from '@/features/payout/hooks/usePayoutFlow';
import { usePayoutForm } from '@/features/payout/hooks/usePayoutForm';
import { useScreenshotWarning } from '@/features/payout/hooks/useScreenshotWarning';
import { useSubmitPayout } from '@/features/payout/hooks/useSubmitPayout';
import type { PayoutDraft } from '@/features/payout/schema';
import { isScreenSecurityAvailable } from '@/modules/screen-security/screen-security';

export function usePayoutController() {
  const [flow, dispatch] = usePayoutFlow();
  const form = usePayoutForm();
  const screenshotWarning = useScreenshotWarning();
  const sendPayout = useSubmitPayout();
  const nativeSecurityAvailable = isScreenSecurityAvailable();
  const submissionInProgress = useRef(false);
  const reviewDraft = getReviewDraft(flow);
  const busy = flow.status === 'authenticating' || flow.status === 'submitting';
  const error = flow.status === 'failed' ? flow.error : undefined;

  const review = (draft: PayoutDraft) => dispatch({ type: 'REVIEW', draft });

  const confirm = async () => {
    if (!reviewDraft || busy || submissionInProgress.current) {
      return;
    }

    submissionInProgress.current = true;
    try {
      const submission = await sendPayout(reviewDraft, {
        onBiometricRequired: () => dispatch({ type: 'AUTHENTICATE' }),
        onSubmitting: () => dispatch({ type: 'SUBMIT' }),
      });
      if (submission.kind === 'aborted') {
        dispatch({
          type: 'FAILED',
          draft: reviewDraft,
          error: {
            kind: 'biometric',
            message: 'Biometric authentication was cancelled or failed. Your payout was not submitted.',
          },
        });
        return;
      }
      dispatch({ type: 'SUCCEEDED', result: submission.result });
    } catch (caughtError) {
      dispatch({
        type: 'FAILED',
        draft: reviewDraft,
        error: mapPayoutError(caughtError),
      });
    } finally {
      submissionInProgress.current = false;
    }
  };

  const edit = () => dispatch({ type: 'EDIT' });
  const reset = () => {
    form.reset();
    dispatch({ type: 'RESET' });
    screenshotWarning.dismiss();
  };

  return {
    flow,
    busy,
    error,
    reviewDraft,
    form,
    screenshotWarning,
    nativeSecurityAvailable,
    review,
    confirm,
    edit,
    reset,
  };
}

function getReviewDraft(flow: ReturnType<typeof usePayoutFlow>[0]) {
  switch (flow.status) {
    case 'confirming':
    case 'authenticating':
    case 'submitting':
    case 'failed':
      return flow.draft;
    case 'editing':
    case 'result':
      return null;
    default:
      return assertNever(flow);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unhandled payout flow state: ${JSON.stringify(value)}`);
}
