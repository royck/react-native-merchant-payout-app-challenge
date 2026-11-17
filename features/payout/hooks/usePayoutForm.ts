import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { payoutSchema, type PayoutDraft } from '@/features/payout/schema';

export function usePayoutForm() {
  return useForm<PayoutDraft>({
    resolver: zodResolver(payoutSchema),
    mode: 'onChange',
    defaultValues: { amount: '', currency: 'GBP', iban: '' },
  });
}
