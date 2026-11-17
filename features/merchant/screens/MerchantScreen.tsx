import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useMerchant } from '@/features/merchant/hooks/useMerchant';
import { formatMoney } from '@/lib/money';
import type { ActivityItem } from '@/types/api';
import { colors, radius, sizes, spacing, typography } from '@/theme/tokens';

export default function MerchantScreen() {
  const router = useRouter();
  const { data: merchant, error, isPending, refetch } = useMerchant();

  const renderActivity = (item: ActivityItem) => (
    <View key={item.id} style={styles.activityRow}>
      <View style={styles.activityIcon}>
        <ThemedText style={styles.activityIconText}>
          {item.type === 'deposit' ? '+' : '−'}
        </ThemedText>
      </View>
      <ThemedText numberOfLines={1} style={styles.activityDescription}>
        {item.description}
      </ThemedText>
      <ThemedText style={styles.activityAmount}>
        {formatMoney(item.amount, item.currency)}
      </ThemedText>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heading}>
        <View>
          <ThemedText style={styles.eyebrow}>MERCHANT ACCOUNT</ThemedText>
          <ThemedText type="title" style={styles.title}>Good morning</ThemedText>
        </View>
        <View style={styles.avatar}>
          <ThemedText style={styles.avatarText}>M</ThemedText>
        </View>
      </View>

      {isPending ? (
        <View style={styles.stateCard}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText style={styles.stateText}>Loading your account…</ThemedText>
        </View>
      ) : error ? (
        <View style={styles.stateCard} accessibilityRole="alert">
          <ThemedText style={styles.error}>
            {error instanceof Error ? error.message : 'Unable to load your account.'}
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            onPress={() => void refetch()}
            style={styles.retryButton}
          >
            <ThemedText style={styles.retryText}>Try again</ThemedText>
          </Pressable>
        </View>
      ) : merchant ? (
        <>
          <View style={styles.balanceCard}>
            <ThemedText style={styles.balanceLabel}>AVAILABLE BALANCE</ThemedText>
            <ThemedText style={styles.balanceValue}>
              {formatMoney(merchant.available_balance, merchant.currency)}
            </ThemedText>
            <View style={styles.balanceDivider} />
            <View style={styles.pendingRow}>
              <ThemedText style={styles.pendingLabel}>Pending</ThemedText>
              <ThemedText style={styles.pendingValue}>
                {formatMoney(merchant.pending_balance, merchant.currency)}
              </ThemedText>
            </View>
          </View>

          <View style={styles.sectionHeading}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Recent activity</ThemedText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Show all activity"
              onPress={() => router.push('/activity')}
              hitSlop={8}
            >
              <ThemedText style={styles.showMore}>Show more</ThemedText>
            </Pressable>
          </View>
          <View style={styles.activityCard}>
            {merchant.activity.slice(0, 3).map(renderActivity)}
            {merchant.activity.length === 0 && (
              <ThemedText style={styles.emptyActivity}>No recent activity.</ThemedText>
            )}
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.page, paddingTop: spacing.section, paddingBottom: spacing.section },
  heading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  eyebrow: { ...typography.eyebrow, ...typography.eyebrowWide, color: colors.textSecondary, fontWeight: '700' },
  title: { ...typography.merchantTitle, color: colors.text, marginTop: spacing.xxs },
  avatar: {
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    borderRadius: radius.avatar,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySubtle,
  },
  avatarText: { ...typography.body, color: colors.primary, fontWeight: '700' },
  balanceCard: {
    backgroundColor: colors.surfaceBalance,
    borderRadius: radius.hero,
    padding: spacing.page,
    marginBottom: spacing.section,
  },
  balanceLabel: { ...typography.eyebrow, ...typography.eyebrowCompact, color: colors.textOnBalanceMuted, fontWeight: '700' },
  balanceValue: { ...typography.balance, color: colors.textOnBalance, fontWeight: '700', marginTop: spacing.mdPlus },
  balanceDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.surfaceBalanceDivider, marginVertical: spacing.lgPlus },
  pendingRow: { flexDirection: 'row', justifyContent: 'space-between' },
  pendingLabel: { color: colors.textOnBalanceSecondary },
  pendingValue: { color: colors.textOnBalance, fontWeight: '600' },
  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.mdPlus,
  },
  sectionTitle: { ...typography.listTitle, color: colors.text },
  showMore: {
    minHeight: sizes.touchTarget,
    textAlignVertical: 'center',
    color: colors.primary,
    fontWeight: '700',
    ...typography.bodySmall,
  },
  activityCard: { backgroundColor: colors.surface, borderRadius: radius.card, paddingHorizontal: spacing.lg },
  activityRow: {
    minHeight: sizes.activityRow,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
    gap: spacing.smPlus,
  },
  activityIcon: {
    width: sizes.icon,
    height: sizes.icon,
    borderRadius: sizes.activityIconRadius,
    backgroundColor: colors.primaryIcon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIconText: { ...typography.title, color: colors.primary, fontWeight: '600' },
  activityDescription: { ...typography.bodySmall, color: colors.textStrong, flex: 1 },
  activityAmount: { ...typography.small, color: colors.textStrong, fontWeight: '700' },
  emptyActivity: { color: colors.textSecondary, textAlign: 'center', paddingVertical: spacing.xxl },
  stateCard: {
    minHeight: sizes.stateCardMinHeight,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  stateText: { color: colors.textSecondary, marginTop: spacing.md },
  error: { color: colors.error, textAlign: 'center' },
  retryButton: {
    minHeight: sizes.touchTarget,
    backgroundColor: colors.primary,
    borderRadius: radius.medium,
    paddingHorizontal: spacing.lgPlus,
    paddingVertical: spacing.smPlus,
    marginTop: spacing.md,
    justifyContent: 'center',
  },
  retryText: { color: colors.onPrimary, fontWeight: '700' },
});
