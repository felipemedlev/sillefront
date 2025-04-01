import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useSubscription } from '../context/SubscriptionContext';
import { COLORS, FONT_SIZES, SPACING, SUBSCRIPTION_TIERS } from '../types/constants';
import { SubscriptionTier } from '../types/subscription';
import TierCard from '../components/subscription/TierCard'; // Use the created component

export default function SubscriptionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { subscribe, isLoading, error: subscriptionError } = useSubscription(); // Get subscribe function and state

  const handleSubscribe = async (tier: SubscriptionTier) => {
    if (isLoading) return; // Prevent multiple clicks while processing

    try {
      await subscribe(tier);
      // Find tier name for confirmation message
      const tierDetails = SUBSCRIPTION_TIERS.find(t => t.id === tier);
      Alert.alert(
        "¡Suscripción Exitosa!",
        `Tu suscripción ${tierDetails?.name || tier} ha sido activada.`,
        [{ text: "OK", onPress: () => router.back() }] // Navigate back on confirmation
      );
    } catch (err) {
      // Error is already logged in the context, but we can show an alert here too
      Alert.alert("Error", "Hubo un problema al procesar tu suscripción. Por favor, intenta de nuevo.");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color={COLORS.TEXT_PRIMARY} />
        </Pressable>
        <Text style={styles.headerTitle}>Suscripción Sillé AI Box</Text>
        <View style={{ width: SPACING.LARGE }} /> {/* Spacer */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.explanationText}>
          Recibe mensualmente una selección personalizada de 4 decants basada en tus preferencias,
          generada por nuestra IA. Elige el plan que mejor se adapte a ti:
        </Text>

        {/* Subscription Tiers */}
        <View style={styles.tiersContainer}>
          {SUBSCRIPTION_TIERS.map((tier) => (
            <TierCard
              key={tier.id}
              tierDetails={tier}
              onSelect={handleSubscribe}
              isDisabled={isLoading} // Pass loading state to disable button
            />
          ))}
        </View>

        {subscriptionError && (
          <Text style={styles.errorText}>Error: {subscriptionError}</Text>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_ALT,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.MEDIUM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    backgroundColor: COLORS.BACKGROUND,
  },
  backButton: {
    padding: SPACING.SMALL,
  },
  headerTitle: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  scrollContent: {
    padding: SPACING.LARGE,
  },
  explanationText: {
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.XLARGE,
    textAlign: 'center',
    lineHeight: FONT_SIZES.REGULAR * 1.5,
  },
  tiersContainer: {
    gap: SPACING.LARGE,
  },
  // Placeholder Styles - will be replaced by TierCard component styles
  tierCardPlaceholder: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    padding: SPACING.LARGE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  tierName: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SMALL,
  },
  tierPrice: {
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.ACCENT,
    fontWeight: '700',
    marginBottom: SPACING.MEDIUM,
  },
  tierDescription: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.LARGE,
  },
  subscribeButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.MEDIUM,
    borderRadius: 8,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: COLORS.BACKGROUND,
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  errorText: {
    marginTop: SPACING.MEDIUM,
    color: COLORS.ERROR,
    textAlign: 'center',
    fontSize: FONT_SIZES.SMALL,
  },
});