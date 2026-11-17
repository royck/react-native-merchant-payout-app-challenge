import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ConfirmationStep } from '@/features/payout/components/ConfirmationStep';
import { PayoutForm } from '@/features/payout/components/PayoutForm';
import { ResultStep } from '@/features/payout/components/ResultStep';
import { usePayoutController } from '@/features/payout/hooks/usePayoutController';
import { styles } from '@/features/payout/screens/PayoutScreen.styles';

const SCREEN_COPY = {
  editing: ['New payout', 'Send funds to your bank account.'],
  confirming: ['Review payout', 'Check the details before confirming.'],
  authenticating: ['Review payout', 'Verify your identity to continue.'],
  submitting: ['Review payout', 'Submitting your payout…'],
  result: ['Payout status', 'Your payout request has been processed.'],
  failed: ['Review payout', 'Check the details before confirming.'],
} as const;

export default function PayoutScreen() {
  const payout = usePayoutController();
  const [title, subtitle] = SCREEN_COPY[payout.flow.status];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          <ThemedText style={styles.eyebrow}>MOVE YOUR MONEY</ThemedText>
          <ThemedText type="title" style={styles.title}>{title}</ThemedText>
          <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
          {!payout.nativeSecurityAvailable && payout.flow.status !== 'result' && (
            <View accessibilityRole="alert" style={styles.warning}>
              <ThemedText style={styles.warningText}>
                Native payout security is not installed. Rebuild the native development app
                to enable device identity and biometric verification.
              </ThemedText>
            </View>
          )}
          {payout.screenshotWarning.visible && (
            <View accessibilityRole="alert" style={styles.warning}>
              <ThemedText style={styles.warningText}>
                Screenshot detected. Keep your payout details private.
              </ThemedText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Dismiss screenshot warning"
                onPress={payout.screenshotWarning.dismiss}
                style={styles.dismissButton}
              >
                <ThemedText style={styles.dismiss}>×</ThemedText>
              </Pressable>
            </View>
          )}
          {payout.flow.status === 'editing' && (
            <PayoutForm
              control={payout.form.control}
              errors={payout.form.formState.errors}
              isValid={payout.form.formState.isValid}
              currency={payout.form.watch('currency')}
              onCurrencyChange={(currency) =>
                payout.form.setValue('currency', currency, { shouldDirty: true })
              }
              onSubmit={payout.form.handleSubmit(payout.review)}
            />
          )}
          {payout.reviewDraft && (
            <ConfirmationStep
              draft={payout.reviewDraft}
              error={payout.error}
              busy={payout.busy}
              onConfirm={() => void payout.confirm()}
              onEdit={payout.edit}
            />
          )}
          {payout.flow.status === 'result' && (
            <ResultStep result={payout.flow.result} onReset={payout.reset} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
