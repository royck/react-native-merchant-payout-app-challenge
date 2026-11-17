import { z } from 'zod';

import { isValidIban } from '@/lib/iban';
import { parseMoneyInput } from '@/lib/money';

export const payoutSchema = z.object({
  amount: z.string().refine((value) => {
    const amount = parseMoneyInput(value);
    return amount !== null && amount > 0;
  }, 'Enter a positive amount with up to two decimal places.'),
  currency: z.enum(['GBP', 'EUR']),
  iban: z
    .string()
    .transform((value) => value.replace(/\s/g, '').toUpperCase())
    .refine(isValidIban, 'Enter a valid IBAN, including its check digits.'),
});

export type PayoutDraft = z.output<typeof payoutSchema>;
