import React, { useState } from 'react'; // Added useState
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform, Alert } from 'react-native'; // Added Alert
import { useRouter, useLocalSearchParams } from 'expo-router'; // Import useLocalSearchParams
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient'; // No longer needed
import { COLORS, FONT_SIZES, SPACING, FONTS } from '../types/constants'; // Added FONTS
import { useAuth } from '../src/context/AuthContext';
import { ActivityIndicator } from 'react-native';
import { placeOrder, ApiOrderCreatePayload } from '../src/services/api'; // Added import for placeOrder

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // Retrieve the finalPrice parameter passed from the cart screen
  const { finalPrice } = useLocalSearchParams<{ finalPrice?: string }>();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false); // Added state for order placement loading
  const [orderError, setOrderError] = useState<string | null>(null); // Added state for order error

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

  const handlePlaceOrder = async () => {
    if (!user) {
      Alert.alert("Error", "Debes iniciar sesión para realizar un pedido.");
      router.push('/login');
      return;
    }

    // For testing, use a hardcoded address
    const testShippingAddress = "Test Address 123, Test Commune, Test City";

    setIsPlacingOrder(true);
    setOrderError(null);

    const payload: ApiOrderCreatePayload = {
      shipping_address: testShippingAddress,
    };

    try {
      const order = await placeOrder(payload);
      console.log('Order placed successfully:', order);
      Alert.alert("Pedido Realizado", "¡Tu pedido ha sido realizado con éxito! (TEST)");
      // TODO: Navigate to an order confirmation screen or clear cart
      // For now, navigate back or to home
      router.replace('/home');
    } catch (error: any) {
      console.error('Error placing order:', error);
      const errorMessage = error.data?.detail || error.message || "Ocurrió un error al realizar el pedido. Por favor, inténtalo de nuevo.";
      setOrderError(errorMessage);
      Alert.alert("Error al Realizar Pedido", errorMessage);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
         <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
           <Feather name="arrow-left" size={24} color={COLORS.TEXT_PRIMARY} />
         </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <TouchableOpacity onPress={() => router.push({ pathname: '/subscription' as any })} activeOpacity={0.9} style={styles.subscriptionBanner}>
        <View style={styles.bannerTextContainer}>
          <Text style={styles.bannerHeadline}>✨ Vive una experiencia única ✨</Text>
          <Text style={styles.bannerSubHeadline}>¡Suscríbete a AI Box y ahorra en cada envío!</Text>
        </View>
        <Feather name="arrow-right-circle" size={28} color={COLORS.BACKGROUND} />
      </TouchableOpacity>

      {/* Main Content */}
      <ScrollView style={styles.contentScrollView} contentContainerStyle={styles.contentContainer}>
        {/* Shipping Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dirección de Envío</Text>
          <View style={styles.inputWrapper}>
            <Feather name="user" size={20} color={COLORS.TEXT_SECONDARY} style={styles.inputIconStyle} />
            <TextInput style={styles.textInputStyle} placeholder="Nombre Completo" placeholderTextColor={COLORS.TEXT_SECONDARY} />
          </View>
          <View style={styles.inputWrapper}>
            <Feather name="map-pin" size={20} color={COLORS.TEXT_SECONDARY} style={styles.inputIconStyle} />
            <TextInput style={styles.textInputStyle} placeholder="Dirección" placeholderTextColor={COLORS.TEXT_SECONDARY} />
          </View>
          <View style={styles.inputWrapper}>
            <Feather name="navigation" size={20} color={COLORS.TEXT_SECONDARY} style={styles.inputIconStyle} />
            <TextInput style={styles.textInputStyle} placeholder="Comuna" placeholderTextColor={COLORS.TEXT_SECONDARY} />
          </View>
          <View style={styles.inputWrapper}>
            <Feather name="compass" size={20} color={COLORS.TEXT_SECONDARY} style={styles.inputIconStyle} />
            <TextInput style={styles.textInputStyle} placeholder="Ciudad" placeholderTextColor={COLORS.TEXT_SECONDARY} />
          </View>
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
            <Text style={styles.summaryValue}>Gratis</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotalRow]}>
            <Text style={styles.summaryTotalLabel}>Total:</Text>
            <Text style={styles.summaryTotalValue}>${finalPriceValue.toLocaleString('de-DE')}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button Footer */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={handlePlaceOrder} activeOpacity={0.8} style={styles.placeOrderButton} disabled={isPlacingOrder}>
          {isPlacingOrder ? (
            <ActivityIndicator color={COLORS.BACKGROUND} />
          ) : (
            <Text style={styles.placeOrderButtonText}>Realizar Pedido (${finalPriceValue.toLocaleString('de-DE')})</Text>
          )}
        </TouchableOpacity>
        {orderError && <Text style={styles.errorText}>{orderError}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Set to white as per user request
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.MEDIUM,
    backgroundColor: COLORS.BACKGROUND, // White or light background for header
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER, // Softer border
  },
  backButton: {
    padding: SPACING.SMALL,
    marginRight: SPACING.SMALL, // Ensure space if title is long
  },
  headerTitle: {
    fontSize: FONT_SIZES.XLARGE, // Slightly larger
    fontWeight: 'bold', // Bolder
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    flex: 1, // Allow title to take space and center correctly
  },
  subscriptionBanner: {
    backgroundColor: '#4A4A4A', // Dark gray background
    paddingVertical: SPACING.LARGE,
    paddingHorizontal: SPACING.LARGE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: SPACING.MEDIUM, // More rounded
    marginHorizontal: SPACING.MEDIUM,
    marginTop: SPACING.LARGE,
    marginBottom: SPACING.MEDIUM, // Added margin bottom
    elevation: 2, // Subtle shadow for depth
    shadowColor: '#000', // Shadow for dark gray button
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  bannerTextContainer: {
    flex: 1,
    marginRight: SPACING.MEDIUM,
    alignItems: 'center', // Center text content horizontally
  },
  bannerHeadline: {
    color: '#FFFFFF', // Explicit white for visibility
    fontSize: FONT_SIZES.LARGE, // Larger headline
    fontWeight: 'bold',
    marginBottom: SPACING.XSMALL,
  },
  bannerSubHeadline: { // New style for the sub-headline
    color: '#FFFFFF', // Explicit white for visibility (was WHITE_TRANSLUCENT)
    fontSize: FONT_SIZES.REGULAR,
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  contentScrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.MEDIUM, // Consistent horizontal padding
    paddingVertical: SPACING.LARGE,
  },
  section: {
    backgroundColor: COLORS.BACKGROUND_ALT || '#F5F5F5', // Light gray for contrast with white screen
    borderRadius: SPACING.MEDIUM, // More rounded corners for cards
    padding: SPACING.LARGE,
    marginBottom: SPACING.LARGE, // Space between sections
    ...Platform.select({ // Platform-specific shadow for card effect
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sectionTitle: {
    fontSize: FONT_SIZES.LARGE, // Adjusted for better hierarchy
    fontWeight: '600', // Semi-bold
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.LARGE, // More space below title
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_ALT, // Light grey background for input area
    borderWidth: 1,
    borderColor: COLORS.BORDER, // Softer border
    borderRadius: SPACING.SMALL,
    paddingHorizontal: SPACING.MEDIUM,
    marginBottom: SPACING.MEDIUM,
  },
  inputIconStyle: { // New style for input icons
    marginRight: SPACING.MEDIUM,
  },
  textInputStyle: { // New style for the TextInput itself
    flex: 1,
    paddingVertical: SPACING.MEDIUM,
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.TEXT_PRIMARY,
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  paymentButton: {
    borderColor: COLORS.PRIMARY,
    borderWidth: 1.5, // Slightly thicker border for secondary button
    paddingVertical: SPACING.MEDIUM,
    paddingHorizontal: SPACING.LARGE,
    borderRadius: SPACING.SMALL,
    alignItems: 'center',
    marginTop: SPACING.MEDIUM,
  },
  paymentButtonText: {
    color: COLORS.PRIMARY,
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '600', // Semi-bold
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.MEDIUM, // Increased margin
    alignItems: 'center',
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
  },
  summaryTotalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER, // Softer border
    marginTop: SPACING.SMALL, // More margin
    paddingTop: SPACING.LARGE, // More padding
  },
  summaryTotalLabel: {
    fontSize: FONT_SIZES.LARGE, // Larger
    color: COLORS.TEXT_PRIMARY,
    fontWeight: 'bold', // Bold
  },
  summaryTotalValue: {
    fontSize: FONT_SIZES.LARGE, // Larger
    color: COLORS.PRIMARY, // Emphasize with primary color
    fontWeight: 'bold',
  },
  footer: {
    paddingHorizontal: SPACING.MEDIUM,
    paddingTop: SPACING.MEDIUM,
    paddingBottom: Platform.OS === 'ios' ? SPACING.XLARGE : SPACING.LARGE, // Adjust for safe area notch
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    backgroundColor: COLORS.BACKGROUND, // Consistent background
  },
  placeOrderButton: {
    backgroundColor: '#000000', // Solid black background
    paddingVertical: SPACING.LARGE, // Taller button
    paddingHorizontal: SPACING.LARGE,
    borderRadius: SPACING.MEDIUM, // More rounded
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2, // Subtle shadow for depth
    shadowColor: '#000', // Shadow for black button
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  placeOrderButtonText: {
    color: '#FFFFFF', // Explicit white for visibility
    fontSize: FONT_SIZES.LARGE,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.TEXT_PRIMARY,
    marginTop: SPACING.MEDIUM,
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  errorText: { // Added error text style
    color: COLORS.ERROR,
    textAlign: 'center',
    marginTop: SPACING.MEDIUM,
    fontSize: FONT_SIZES.REGULAR,
    fontFamily: FONTS.INSTRUMENT_SANS,
  }
});