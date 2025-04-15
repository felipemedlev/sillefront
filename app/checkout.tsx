import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router'; // Import useLocalSearchParams
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, FONTS } from '../types/constants'; // Added FONTS
import { useAuth } from '../src/context/AuthContext';
import { ActivityIndicator } from 'react-native';

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // Retrieve the finalPrice parameter passed from the cart screen
  const { finalPrice } = useLocalSearchParams<{ finalPrice?: string }>();
  const { user, isLoading: isAuthLoading } = useAuth();

  // Convert finalPrice string to number, default to 0 if undefined or invalid
  const finalPriceValue = finalPrice ? parseFloat(finalPrice) : 0;

  // If still loading auth state, show a loading indicator
  if (isAuthLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  // If not authenticated, redirect to login (you could also use the useEffect approach)
  if (!user) {
    router.replace('/login');
    return null;
  }

  // TODO: Add checkout logic (address, payment, order summary using finalPriceValue)

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

      {/* Subscription Banner - High Converting */}
      <TouchableOpacity
        style={styles.subscriptionBanner}
        onPress={() => router.push({ pathname: '/subscription' as any })}
        activeOpacity={0.8}
      >
        <View style={styles.bannerTextContainer}>
          <Text style={styles.bannerHeadline}>✨Vive una experiencia única con cada fragancia✨</Text>
          <Text style={styles.bannerText}>¡Suscríbete a AI Box y ahorra!</Text>
        </View>
        <Feather name="chevron-right" size={24} color={COLORS.BACKGROUND} /> {/* Slightly larger icon */}
      </TouchableOpacity>

      {/* Main Content */}
      <ScrollView style={styles.contentScrollView} contentContainerStyle={styles.contentContainer}>
        {/* Shipping Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dirección de Envío</Text>
          <TextInput style={styles.input} placeholder="Nombre Completo" placeholderTextColor={COLORS.TEXT_SECONDARY} />
          <TextInput style={styles.input} placeholder="Dirección Línea 1" placeholderTextColor={COLORS.TEXT_SECONDARY} />
          <TextInput style={styles.input} placeholder="Ciudad" placeholderTextColor={COLORS.TEXT_SECONDARY} />
          <TextInput style={styles.input} placeholder="Código Postal" placeholderTextColor={COLORS.TEXT_SECONDARY} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="País" placeholderTextColor={COLORS.TEXT_SECONDARY} />
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Método de Pago</Text>
          <TouchableOpacity style={styles.paymentButton}>
             <Text style={styles.paymentButtonText}>Agregar Método de Pago</Text>
          </TouchableOpacity>
          {/* TODO: Implement actual payment integration (e.g., Stripe, MercadoPago) */}
        </View>

        {/* Order Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen del Pedido</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>${finalPriceValue.toLocaleString('de-DE')}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Envío:</Text>
            <Text style={styles.summaryValue}>Gratis</Text> {/* Placeholder */}
          </View>
          <View style={[styles.summaryRow, styles.summaryTotalRow]}>
            <Text style={styles.summaryTotalLabel}>Total:</Text>
            <Text style={styles.summaryTotalValue}>${finalPriceValue.toLocaleString('de-DE')}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button Footer */}
      <View style={styles.footer}>
         <TouchableOpacity style={styles.placeOrderButton} onPress={() => console.log('Place Order Pressed')}>
           <Text style={styles.placeOrderButtonText}>Realizar Pedido (${finalPriceValue.toLocaleString('de-DE')})</Text>
         </TouchableOpacity>
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
    textAlign: 'center',
    color: COLORS.TEXT_PRIMARY,
  },
  subscriptionBanner: { // High converting style
    backgroundColor: COLORS.ACCENT, // Black background
    paddingVertical: SPACING.MEDIUM, // Adjusted padding slightly
    paddingHorizontal: SPACING.LARGE,
    flexDirection: 'row', // Align text container and icon horizontally
    alignItems: 'center', // Center items vertically
    justifyContent: 'space-between', // Space out text container and icon
    borderRadius: SPACING.SMALL, // Subtle rounding
    marginHorizontal: SPACING.MEDIUM, // Side margins
    marginTop: SPACING.MEDIUM, // Top margin
  },
  bannerTextContainer: {
    flex: 1, // take available space
    marginRight: SPACING.SMALL, // space before icon
    alignItems: 'center', // center horizontally
    justifyContent: 'center', // center vertically
  },
  contentScrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.LARGE,
    paddingBottom: 120, // Extra padding to ensure content doesn't hide behind the footer
  },
  section: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: SPACING.SMALL,
    padding: SPACING.LARGE,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MEDIUM,
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  input: {
    backgroundColor: COLORS.BACKGROUND_ALT, // Slightly different background for input
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: SPACING.SMALL,
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.MEDIUM, // Adjusted for better vertical spacing
    marginBottom: SPACING.MEDIUM,
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.TEXT_PRIMARY,
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  paymentButton: {
    borderColor: COLORS.PRIMARY,
    borderWidth: 1,
    padding: SPACING.MEDIUM,
    borderRadius: SPACING.SMALL,
    alignItems: 'center',
    marginTop: SPACING.SMALL, // Add some margin top
  },
  paymentButtonText: {
    color: COLORS.PRIMARY,
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '500',
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.SMALL,
    alignItems: 'center', // Align items vertically
  },
  summaryLabel: {
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  summaryValue: {
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '500',
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  summaryTotalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    marginTop: SPACING.MEDIUM,
    paddingTop: SPACING.MEDIUM,
  },
  summaryTotalLabel: {
    fontSize: FONT_SIZES.LARGE,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '600',
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  summaryTotalValue: {
    fontSize: FONT_SIZES.LARGE,
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  footer: {
    padding: SPACING.MEDIUM,
    paddingBottom: SPACING.LARGE, // Ensure space with safe area
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    backgroundColor: COLORS.BACKGROUND, // Match header/section background
  },
  placeOrderButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.MEDIUM, // Adjusted padding
    paddingHorizontal: SPACING.LARGE,
    borderRadius: SPACING.SMALL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeOrderButtonText: {
    color: COLORS.BACKGROUND,
    fontSize: FONT_SIZES.LARGE,
    fontWeight: '600',
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  bannerHeadline: { // Style for the main attention-grabbing text
    color: COLORS.BACKGROUND,
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '600', // Bolder
    fontFamily: FONTS.INSTRUMENT_SANS,
    marginBottom: SPACING.XSMALL, // Space between headline and sub-headline
  },
  bannerText: { // Style for the sub-headline/CTA
    color: COLORS.BACKGROUND, // White text
    fontSize: FONT_SIZES.SMALL, // Smaller font for sub-headline
    fontWeight: '400', // Normal weight
    fontFamily: FONTS.INSTRUMENT_SANS, // Clean font
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.LARGE,
    paddingTop: SPACING.LARGE, // Adjusted padding top
  },
  placeholderText: {
    fontSize: FONT_SIZES.LARGE,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MEDIUM,
  },
  finalPriceText: { // Style for displaying the final price
    fontSize: FONT_SIZES.LARGE,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: SPACING.LARGE,
  },
  todoText: {
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.TEXT_PRIMARY,
    marginTop: SPACING.MEDIUM,
  },
});