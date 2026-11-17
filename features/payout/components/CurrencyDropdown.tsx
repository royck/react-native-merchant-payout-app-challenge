import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import type { Currency } from "@/types/api";
import { colors, radius, sizes, spacing, typography } from "@/theme/tokens";

const CURRENCIES: readonly Currency[] = ["GBP", "EUR"];

interface CurrencyDropdownProps {
  value: Currency;
  onChange: (currency: Currency) => void;
}

export function CurrencyDropdown({ value, onChange }: CurrencyDropdownProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Currency, ${value}`}
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((isExpanded) => !isExpanded)}
        style={styles.trigger}
      >
        <ThemedText style={styles.triggerText}>{value}</ThemedText>
        <ThemedText accessibilityElementsHidden style={styles.chevron}>
          {expanded ? "⌃" : "⌄"}
        </ThemedText>
      </Pressable>
      {expanded && (
        <View style={styles.options}>
          {CURRENCIES.map((currency) => (
            <Pressable
              accessibilityRole="menuitem"
              accessibilityLabel={currency}
              accessibilityState={{ selected: currency === value }}
              key={currency}
              onPress={() => {
                onChange(currency);
                setExpanded(false);
              }}
              style={[
                styles.option,
                currency === value && styles.selectedOption,
              ]}
            >
              <ThemedText
                style={[
                  styles.optionText,
                  currency === value && styles.selectedOptionText,
                ]}
              >
                {currency === "GBP" ? "£  GBP" : "€  EUR"}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { minWidth: 112, zIndex: 1 },
  trigger: {
    minHeight: spacing.amountControl,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.button,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  triggerText: {
    ...typography.body,
    color: colors.textStrong,
    fontWeight: "600",
  },
  chevron: { ...typography.body, color: colors.textSecondary },
  options: {
    position: "absolute",
    top: spacing.amountControl + spacing.xs,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.medium,
    backgroundColor: colors.surface,
    overflow: "hidden",
    elevation: 4,
    zIndex: 2,
  },
  option: {
    minHeight: sizes.touchTarget,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  selectedOption: { backgroundColor: colors.surfaceMuted },
  optionText: { ...typography.small, color: colors.textStrong },
  selectedOptionText: { color: colors.primary, fontWeight: "700" },
});
