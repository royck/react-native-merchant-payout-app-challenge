import { StyleSheet } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme/tokens';

export const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.page,
    paddingTop: spacing.page,
    paddingBottom: spacing.section,
  },
  eyebrow: { ...typography.eyebrow, color: colors.textSecondary, fontWeight: '700' },
  title: { ...typography.screenTitle, color: colors.text, marginTop: spacing.xxs },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.xxl,
  },
  warning: {
    backgroundColor: colors.surfaceWarning,
    borderRadius: radius.medium,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  warningText: { ...typography.small, flex: 1, color: colors.textWarning },
  dismissButton: {
    width: spacing.huge,
    height: spacing.huge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismiss: { ...typography.icon, color: colors.textWarning },
});
