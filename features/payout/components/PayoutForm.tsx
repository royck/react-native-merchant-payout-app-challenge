import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { colors, radius, sizes, spacing, typography } from '@/theme/tokens';
import type { PayoutDraft } from '@/features/payout/schema';

interface PayoutFormProps {
  control: Control<PayoutDraft>;
  errors: FieldErrors<PayoutDraft>;
  isValid: boolean;
  currency: PayoutDraft['currency'];
  onCurrencyChange: (currency: PayoutDraft['currency']) => void;
  onSubmit: () => void;
}

export function PayoutForm({
  control,
  errors,
  isValid,
  currency,
  onCurrencyChange,
  onSubmit,
}: PayoutFormProps) {
  return (
    <View style={styles.card}>
      <ThemedText style={styles.label}>Amount</ThemedText>
      <View style={styles.amountInputRow}>
        <Controller
          control={control}
          name="amount"
          render={({ field: { onBlur, onChange, value } }) => (
            <TextInput
              accessibilityLabel="Payout amount"
              accessibilityHint={errors.amount?.message ?? 'Enter the payout amount'}
              style={styles.amountInput}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.textPlaceholder}
              maxLength={14}
            />
          )}
        />
        <ThemedText style={styles.currencyMark}>
          {currency === 'GBP' ? '£' : '€'}
        </ThemedText>
      </View>
      <FieldError message={errors.amount?.message} />

      <ThemedText style={styles.label}>Currency</ThemedText>
      <View style={styles.currencyOptions}>
        {(['GBP', 'EUR'] as const).map((option) => (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ selected: currency === option }}
            key={option}
            onPress={() => onCurrencyChange(option)}
            style={[
              styles.currencyOption,
              currency === option && styles.currencyOptionSelected,
            ]}
          >
            <ThemedText
              style={[
                styles.currencyOptionText,
                currency === option && styles.currencyOptionTextSelected,
              ]}
            >
              {option === 'GBP' ? '£  GBP' : '€  EUR'}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <ThemedText style={styles.label}>Destination IBAN</ThemedText>
      <Controller
        control={control}
        name="iban"
        render={({ field: { onBlur, onChange, value } }) => (
          <TextInput
            accessibilityLabel="Destination IBAN"
            accessibilityHint={errors.iban?.message ?? 'Enter the recipient IBAN'}
            autoCapitalize="characters"
            autoCorrect={false}
            value={value}
            onBlur={onBlur}
            onChangeText={(nextValue) => onChange(nextValue.toUpperCase())}
            placeholder="GB82 WEST 1234 5698 7654 32"
            placeholderTextColor={colors.textPlaceholder}
            style={styles.ibanInput}
          />
        )}
      />
      <FieldError message={errors.iban?.message} />

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !isValid }}
        disabled={!isValid}
        onPress={onSubmit}
        style={[styles.primaryButton, !isValid && styles.buttonDisabled]}
      >
        <ThemedText style={styles.primaryButtonText}>Review payout</ThemedText>
      </Pressable>
    </View>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }
  return (
    <ThemedText
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={styles.validationError}
    >
      {message}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.largeCard, padding: spacing.xl },
  label: { ...typography.small, color: colors.textBody, fontWeight: '700', marginBottom: spacing.sm },
  amountInputRow: {
    minHeight: spacing.amountControl,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.button,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.mdPlus,
    paddingVertical: spacing.xs,
    marginBottom: spacing.xl,
  },
  amountInput: {
    ...typography.title,
    flex: 1,
    color: colors.text,
    fontWeight: '600',
    paddingVertical: spacing.xs,
  },
  currencyMark: { ...typography.title, color: colors.textSecondary, fontWeight: '600' },
  currencyOptions: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  currencyOption: {
    flex: 1,
    minHeight: sizes.touchTarget,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.medium,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyOptionSelected: { borderColor: colors.primary, backgroundColor: colors.surfaceMuted },
  currencyOptionText: { ...typography.small, color: colors.textSecondary, fontWeight: '600' },
  currencyOptionTextSelected: { color: colors.primary },
  ibanInput: {
    ...typography.body,
    minHeight: sizes.touchTarget + spacing.sm,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.medium,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    ...typography.iban,
    marginBottom: spacing.xs,
  },
  validationError: { ...typography.caption, color: colors.error, marginBottom: spacing.sm },
  primaryButton: {
    minHeight: sizes.touchTarget + spacing.sm,
    borderRadius: radius.button,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  buttonDisabled: { backgroundColor: colors.primaryDisabled },
  primaryButtonText: { ...typography.base, color: colors.onPrimary, fontWeight: '700' },
});
