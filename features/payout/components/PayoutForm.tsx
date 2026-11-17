import { Controller, type Control, type FieldErrors } from "react-hook-form";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { colors, radius, sizes, spacing, typography } from "@/theme/tokens";
import type { PayoutDraft } from "@/features/payout/schema";
import { CurrencyDropdown } from "@/features/payout/components/CurrencyDropdown";

interface PayoutFormProps {
  control: Control<PayoutDraft>;
  errors: FieldErrors<PayoutDraft>;
  isValid: boolean;
  currency: PayoutDraft["currency"];
  onCurrencyChange: (currency: PayoutDraft["currency"]) => void;
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
      <View style={styles.amountCurrencyRow}>
        <View style={styles.amountField}>
          <ThemedText style={styles.label}>Amount</ThemedText>
          <View style={styles.amountInputRow}>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onBlur, onChange, value } }) => (
                <TextInput
                  accessibilityLabel="Payout amount"
                  accessibilityHint={
                    errors.amount?.message ?? "Enter the payout amount"
                  }
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
              {currency === "GBP" ? "£" : "€"}
            </ThemedText>
          </View>
        </View>
        <View style={styles.currencyField}>
          <ThemedText style={styles.label}>Currency</ThemedText>
          <CurrencyDropdown value={currency} onChange={onCurrencyChange} />
        </View>
      </View>
      <FieldError message={errors.amount?.message} />

      <ThemedText style={styles.label}>Destination IBAN</ThemedText>
      <Controller
        control={control}
        name="iban"
        render={({ field: { onBlur, onChange, value } }) => (
          <TextInput
            accessibilityLabel="Destination IBAN"
            accessibilityHint={
              errors.iban?.message ?? "Enter the recipient IBAN"
            }
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.largeCard,
    padding: spacing.xl,
  },
  label: {
    ...typography.small,
    color: colors.textBody,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  amountCurrencyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  amountField: { flex: 1, minWidth: 0 },
  currencyField: { position: "relative", zIndex: 2 },
  amountInputRow: {
    minHeight: spacing.amountControl,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.button,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.mdPlus,
    paddingVertical: spacing.xs,
  },
  amountInput: {
    ...typography.title,
    flex: 1,
    color: colors.text,
    fontWeight: "600",
    paddingVertical: spacing.xs,
  },
  currencyMark: {
    ...typography.title,
    color: colors.textSecondary,
    fontWeight: "600",
  },
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
  validationError: {
    ...typography.caption,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  primaryButton: {
    minHeight: sizes.touchTarget + spacing.sm,
    borderRadius: radius.button,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  buttonDisabled: { backgroundColor: colors.primaryDisabled },
  primaryButtonText: {
    ...typography.base,
    color: colors.onPrimary,
    fontWeight: "700",
  },
});
