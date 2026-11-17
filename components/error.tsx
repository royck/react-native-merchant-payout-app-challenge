import type { ErrorBoundaryProps } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { colors, radius, spacing, typography } from '@/theme/tokens';

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={styles.container}>
      <ThemedText type="title">Something went wrong</ThemedText>
      <ThemedText accessibilityRole="alert" style={styles.error}>
        {error.message}
      </ThemedText>
      <Pressable
        accessibilityRole="button"
        onPress={() => void retry()}
        style={styles.button}
      >
        <ThemedText style={styles.buttonText}>Try again</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  error: { ...typography.body, marginTop: spacing.md, textAlign: 'center' },
  button: {
    minHeight: spacing.huge,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
    borderRadius: radius.medium,
    backgroundColor: colors.primary,
  },
  buttonText: { color: colors.onPrimary, fontWeight: '700' },
});
