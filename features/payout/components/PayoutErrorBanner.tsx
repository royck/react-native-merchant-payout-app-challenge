import { useEffect } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';

import type { PayoutError } from '@/features/payout/errors';
import { ThemedText } from '@/components/themed-text';
import { colors, radius, spacing, typography } from '@/theme/tokens';

export function PayoutErrorBanner({ error }: { error: PayoutError }) {
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(error.message);
  }, [error.message]);

  return (
    <View accessibilityRole="alert" style={styles.container}>
      <ThemedText accessibilityLiveRegion="polite" style={styles.message}>
        {error.message}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceError,
    borderRadius: radius.medium,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  message: { ...typography.small, color: colors.error },
});
