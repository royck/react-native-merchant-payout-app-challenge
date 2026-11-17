import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useActivity } from '@/features/activity/hooks/useActivity';
import { formatMoney } from '@/lib/money';
import type { ActivityItem } from '@/types/api';
import { ThemedText } from '@/components/themed-text';
import { colors, radius, sizes, spacing, typography } from '@/theme/tokens';

export function formatDate(value: string): string {
  const date = new Date(value);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export default function ActivityScreen() {
  const router = useRouter();
  const {
    data,
    error,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useActivity();
  const items = data?.pages.flatMap((page) => page.items) ?? [];
  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  const renderItem = useCallback(({ item }: { item: ActivityItem }) => (
    <View style={styles.activityRow}>
      <View style={styles.activityCopy}>
        <ThemedText type="defaultSemiBold">{item.description}</ThemedText>
        <ThemedText style={styles.metadata}>
          {item.type[0].toUpperCase() + item.type.slice(1)} · {formatDate(item.date)}
        </ThemedText>
      </View>
      <ThemedText style={styles.amount}>
        {formatMoney(item.amount, item.currency)}
      </ThemedText>
    </View>
  ), []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View>
          <ThemedText type="title" style={styles.title}>Activity</ThemedText>
          <ThemedText style={styles.subtitle}>Your recent transactions</ThemedText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close activity"
          onPress={() => router.back()}
          hitSlop={8}
        >
          <ThemedText style={styles.closeButton}>Done</ThemedText>
        </Pressable>
      </View>
      {isPending ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText style={styles.feedback}>Loading activity…</ThemedText>
        </View>
      ) : isError && items.length === 0 ? (
        <View style={styles.center} accessibilityRole="alert">
          <ThemedText style={styles.error}>
            {error instanceof Error ? error.message : 'Unable to load activity.'}
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            onPress={() => void refetch()}
            style={styles.retryButton}
          >
            <ThemedText style={styles.retryText}>Try again</ThemedText>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onEndReached={() => void loadMore()}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <ThemedText style={styles.feedback}>No activity to show.</ThemedText>
          }
          ListFooterComponent={
            <View style={styles.footer}>
              {isFetchingNextPage && <ActivityIndicator color={colors.primary} />}
              {isError && (
                <>
                  <ThemedText style={styles.error}>
                    {error instanceof Error ? error.message : 'Unable to load more activity.'}
                  </ThemedText>
                  <Pressable
                    accessibilityRole="button"
                    onPress={loadMore}
                    style={styles.retryButton}
                  >
                    <ThemedText style={styles.retryText}>Try again</ThemedText>
                  </Pressable>
                </>
              )}
              {!hasNextPage && items.length > 0 && (
                <ThemedText style={styles.feedback}>You’re all caught up.</ThemedText>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.page, paddingTop: spacing.lg, paddingBottom: spacing.xl },
  title: { ...typography.screenTitle, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xxs },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.medium,
    padding: spacing.lg,
    marginBottom: spacing.smPlus,
    gap: spacing.md,
  },
  activityCopy: { flex: 1 },
  metadata: { ...typography.small, color: colors.textMuted, marginTop: spacing.xxs },
  amount: { ...typography.small, color: colors.text, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  feedback: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.smPlus },
  error: { ...typography.small, color: colors.error, textAlign: 'center', marginVertical: spacing.sm },
  retryButton: {
    minHeight: sizes.touchTarget,
    backgroundColor: colors.primary,
    borderRadius: radius.medium,
    paddingHorizontal: spacing.lgPlus,
    paddingVertical: spacing.smPlus,
    marginTop: spacing.sm,
    justifyContent: 'center',
  },
  retryText: { ...typography.small, color: colors.onPrimary, fontWeight: '700' },
  closeButton: {
    minWidth: sizes.touchTarget,
    minHeight: sizes.touchTarget,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: colors.primary,
    fontWeight: '700',
    ...typography.body,
  },
  footer: { alignItems: 'center', minHeight: spacing.xxxl, paddingVertical: spacing.smPlus },
});
