import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../types/constants';

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // TODO: Add checkout logic (address, payment, order summary)

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
         <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
           <Feather name="arrow-left" size={24} color={COLORS.TEXT_PRIMARY} />
         </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        {/* Add placeholder for potential header actions */}
        <View style={{ width: 40 }} />
      </View>

      {/* Subscription Banner */}
      <TouchableOpacity
        style={styles.subscriptionBanner}
        onPress={() => router.push({ pathname: '/subscription' as any })} // Use href object + any cast
        activeOpacity={0.7}
      >
        <Text style={styles.bannerText}>✨ ¡Suscríbete al AI Box mensual y ahorra! Ver planes</Text>
      </TouchableOpacity>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.placeholderText}>Checkout Screen</Text>
        <Text style={styles.todoText}>Falta implementar Dirección de env;io, integración de pago y resumen de la orden.</Text>
        {/* Add more placeholder UI elements as needed */}
      </View>
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
  subscriptionBanner: { // Added style
    backgroundColor: COLORS.ACCENT, // Use accent color or another distinct color
    paddingVertical: SPACING.MEDIUM,
    paddingHorizontal: SPACING.LARGE,
    alignItems: 'center',
  },
  bannerText: { // Added style
    color: COLORS.BACKGROUND, // White text on colored background
    fontSize: FONT_SIZES.SMALL,
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    // Adjust justification if needed now that banner is present
    // justifyContent: 'center', // Remove or change if content should start from top
    alignItems: 'center',
    padding: SPACING.LARGE,
    paddingTop: SPACING.XLARGE, // Add padding top to separate from banner
  },
  placeholderText: {
    fontSize: FONT_SIZES.LARGE,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MEDIUM,
  },
  todoText: {
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
});