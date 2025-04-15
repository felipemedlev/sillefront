import React, { useState, useCallback } from 'react'; // Import useCallback
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput, Platform, useWindowDimensions } from 'react-native'; // Import TextInput and useWindowDimensions
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../src/context/AuthContext'; // Updated import after deleting duplicate
import { CartItem } from '../../../types/cart';
import { Coupon } from '../../../types/coupon'; // Import Coupon type
import CartItemComponent from '../../../components/cart/CartItem';
import { COLORS, FONT_SIZES, SPACING, FONTS } from '../../../types/constants'; // Added FONTS
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// --- CartFooter Component ---
interface CartFooterProps {
  totalCartItems: number;
  finalPrice: number;
  discountAmount: number;
  appliedCoupon: Coupon | null;
  couponError: string | null;
  isAuthLoading: boolean;
  isCartLoading: boolean; // Pass cart loading state
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  onCheckoutPress: () => void;
}

const CartFooter: React.FC<CartFooterProps> = React.memo(({
  totalCartItems,
  finalPrice,
  discountAmount,
  appliedCoupon,
  couponError,
  isAuthLoading,
  isCartLoading, // Receive cart loading state
  applyCoupon,
  removeCoupon,
  onCheckoutPress,
}) => {
  const [couponInput, setCouponInput] = useState('');
  const insets = useSafeAreaInsets();

  const handleApplyCoupon = useCallback(() => {
    if (couponInput.trim()) {
      applyCoupon(couponInput.trim());
    }
  }, [couponInput, applyCoupon]);

  // Estimate Tab Bar height (adjust if necessary)
  const tabBarHeightEstimate = 60;
  const totalBottomPadding = insets.bottom + tabBarHeightEstimate + SPACING.MEDIUM;

  // Disable button if cart is empty or auth is loading
  const isCheckoutDisabled = totalCartItems === 0 || isAuthLoading;

  return (
    // Add a wrapper View to apply padding below the actual footer content
    <View style={{ paddingBottom: totalBottomPadding }}>
      <View style={styles.footer}>

        {/* Coupon Section */}
        {totalCartItems > 0 && ( // Only show coupon section if cart is not empty
          <View style={styles.couponSection}>
            {!appliedCoupon ? (
              <>
                <View style={styles.couponInputContainer}>
                  <TextInput
                    style={styles.couponInput}
                    placeholder="Ingresa tu cupón"
                    placeholderTextColor={COLORS.TEXT_SECONDARY}
                    value={couponInput}
                    onChangeText={setCouponInput}
                    autoCapitalize="characters" // Suggest uppercase
                    editable={!isCartLoading} // Disable input while loading cart
                  />
                  <TouchableOpacity
                    style={[styles.applyCouponButton, !couponInput.trim() && styles.applyCouponButtonDisabled]}
                    onPress={handleApplyCoupon}
                    disabled={!couponInput.trim() || isCartLoading}
                  >
                    <Text style={styles.applyCouponButtonText}>Aplicar</Text>
                  </TouchableOpacity>
                </View>
                {couponError && (
                  <Text style={styles.couponErrorText}>{couponError}</Text>
                )}
              </>
            ) : (
              <View style={styles.appliedCouponContainer}>
                <View>
                  <Text style={styles.appliedCouponLabel}>Cupón Aplicado:</Text>
                  <Text style={styles.appliedCouponCode}>{appliedCoupon.code}</Text>
                  <Text style={styles.discountText}>Descuento: -${discountAmount.toLocaleString('de-DE')}</Text>
                </View>
                <TouchableOpacity onPress={removeCoupon} style={styles.removeCouponButton}>
                  <Feather name="x-circle" size={20} color={COLORS.ERROR} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        {/* End Coupon Section */}

        {/* Total Section */}
        <View style={[styles.totalContainer, appliedCoupon && styles.totalContainerWithCoupon]}>
          <Text style={styles.totalLabel}>Total:</Text>
          {/* Display final price after discount */}
          <Text style={styles.totalPrice}>${finalPrice.toLocaleString('de-DE')}</Text>
        </View>
        {/* End Total Section */}

        {/* Checkout Button */}
        <TouchableOpacity
          style={[styles.checkoutButton, isCheckoutDisabled && styles.checkoutButtonDisabled]}
          onPress={onCheckoutPress} // Use the passed handler
          disabled={isCheckoutDisabled} // Disable button when appropriate
          activeOpacity={0.8}
        >
          {isAuthLoading ? (
            <ActivityIndicator color={COLORS.BACKGROUND} />
          ) : (
            <Text style={styles.checkoutButtonText}>Continuar al pago</Text>
          )}
        </TouchableOpacity>
        {/* End Checkout Button */}
      </View>
    </View>
  );
});
// --- End CartFooter Component ---


// --- CartScreen Component ---
export default function CartScreen() {
  const router = useRouter();
const {
  cartItems,
  isLoading: isCartLoading,
  error: cartError,
  removeItemFromCart,
  clearCart,
  totalCartItems,
  appliedCoupon,
  couponError,
  applyCoupon,
  removeCoupon,
  discountAmount,
  finalPrice,
} = useCart();

const DESKTOP_BREAKPOINT = 768;
const { width } = useWindowDimensions();
const isDesktop = width >= DESKTOP_BREAKPOINT;
  const { user, isLoading: isAuthLoading } = useAuth(); // Get user and auth loading state


  const insets = useSafeAreaInsets();

  const handleCheckoutPress = useCallback(() => { // Memoize handler
    if (user) {
      // Pass finalPrice to checkout screen
      router.push({


        pathname: '/checkout',
        params: { finalPrice: finalPrice }, // Pass final price
      });
    } else {
      router.push('/signup'); // Navigate to signup if not logged in
    }
  }, [user, finalPrice, router]); // Add dependencies

  const renderCartItem = useCallback(({ item }: { item: CartItem }) => ( // Memoize renderItem
    <CartItemComponent item={item} onRemove={removeItemFromCart} />
  ), [removeItemFromCart]); // Add dependency

  const renderEmptyCart = useCallback(() => ( // Memoize empty component
    <View style={styles.emptyContainer}>
      <Feather name="shopping-cart" size={60} color={COLORS.TEXT_SECONDARY} />
      <Text style={styles.emptyText}>Tu carrito está vacío.</Text>
      <Text style={styles.emptySubText}>Añade algunos perfumes para empezar.</Text>
    </View>
  ), []);

  const renderHeader = useCallback(() => ( // Memoize header
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Carrito ({totalCartItems})</Text>
      {totalCartItems > 0 && (
        <TouchableOpacity onPress={clearCart} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Vaciar Carrito</Text>
        </TouchableOpacity>
      )}
    </View>
  ), [totalCartItems, clearCart]); // Add dependencies

  // Show loading indicator if cart is loading
  if (isCartLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Cargando Carrito...</Text>
      </View>
    );
  }

  // Display general cart error if present
  if (cartError) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Feather name="alert-circle" size={40} color={COLORS.ERROR} />
        <Text style={styles.errorText}>Error al cargar el carrito: {cartError}</Text>
      </View>
    );
  }

  return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {isDesktop && <View style={{ marginTop: 80 }} />}
        {renderHeader()}
        {cartItems.length === 0 ? (
          renderEmptyCart()
        ) : (
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id}
            // Use the memoized CartFooter component
            ListFooterComponent={
              <CartFooter
                totalCartItems={totalCartItems}
                finalPrice={finalPrice}
                discountAmount={discountAmount}
                appliedCoupon={appliedCoupon}
                couponError={couponError}
                isAuthLoading={isAuthLoading}
                isCartLoading={isCartLoading} // Pass cart loading state
                applyCoupon={applyCoupon}
                removeCoupon={removeCoupon}
                onCheckoutPress={handleCheckoutPress}
              />
            }
            contentContainerStyle={styles.listContent} // Padding for items
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }} // Allow FlatList to take available space
          />
        )}
      </View>
  );
}
// --- End CartScreen Component ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_ALT,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1, // Make sure center content takes full height if needed
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.LARGE,
    paddingVertical: SPACING.MEDIUM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    backgroundColor: COLORS.BACKGROUND,
  },
  headerTitle: {
    fontSize: FONT_SIZES.XLARGE,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    fontFamily: FONTS.INSTRUMENT_SANS, // Added font
  },
  clearButton: {
    padding: SPACING.SMALL,
  },
  clearButtonText: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.ERROR,
    fontWeight: '500',
    fontFamily: FONTS.INSTRUMENT_SANS, // Added font
  },
  listContent: {
    paddingHorizontal: SPACING.MEDIUM,
    paddingTop: SPACING.MEDIUM,
    // The main paddingBottom is handled by the wrapper in renderFooter
    paddingBottom: SPACING.MEDIUM, // Standard padding below the last list item
  },
  loadingText: {
    marginTop: SPACING.MEDIUM,
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: FONTS.INSTRUMENT_SANS, // Added font
  },
  errorText: { // General error text
    marginTop: SPACING.MEDIUM,
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.ERROR,
    textAlign: 'center',
    paddingHorizontal: SPACING.LARGE,
    fontFamily: FONTS.INSTRUMENT_SANS, // Added font
  },
  emptyContainer: {
    flex: 1, // Allow empty container to take full space
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.XLARGE,
  },
  emptyText: {
    marginTop: SPACING.LARGE,
    fontSize: FONT_SIZES.LARGE,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    fontFamily: FONTS.INSTRUMENT_SANS, // Added font
  },
  emptySubText: {
    marginTop: SPACING.SMALL,
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    fontFamily: FONTS.INSTRUMENT_SANS, // Added font
  },
  footer: {
    // Style for the content *inside* the ListFooterComponent wrapper
    backgroundColor: COLORS.BACKGROUND,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    paddingHorizontal: SPACING.LARGE,
    paddingTop: SPACING.MEDIUM,
    // paddingBottom is now handled by the wrapper View in renderFooter
  },
  // --- Coupon Styles ---
  couponSection: {
    marginBottom: SPACING.LARGE, // Space between coupon and total
  },
  couponInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL, // Adjust for height
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.TEXT_PRIMARY,
    marginRight: SPACING.SMALL,
    height: 44, // Consistent height
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  applyCouponButton: {
    backgroundColor: COLORS.ACCENT, // Use accent color
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL, // Adjust for height
    borderRadius: 8,
    height: 44, // Consistent height
    justifyContent: 'center',
  },
  applyCouponButtonDisabled: {
    backgroundColor: COLORS.BORDER, // Grey out when disabled
    opacity: 0.7,
  },
  applyCouponButtonText: {
    color: COLORS.BACKGROUND,
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '600',
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  couponErrorText: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.ERROR,
    marginTop: SPACING.XSMALL,
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  appliedCouponContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E8F5E9', // Light green background
    padding: SPACING.MEDIUM,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A5D6A7', // Green border
  },
  appliedCouponLabel: {
    fontSize: FONT_SIZES.SMALL,
    color: '#2E7D32', // Dark green text
    fontFamily: FONTS.INSTRUMENT_SANS,
    marginBottom: SPACING.XSMALL,
  },
  appliedCouponCode: {
    fontSize: FONT_SIZES.REGULAR,
    color: '#1B5E20', // Darker green text
    fontWeight: '700',
    fontFamily: FONTS.INSTRUMENT_SANS,
    marginBottom: SPACING.XSMALL,
  },
  discountText: {
    fontSize: FONT_SIZES.SMALL,
    color: '#2E7D32',
    fontWeight: '600',
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  removeCouponButton: {
    padding: SPACING.SMALL,
  },
  // --- End Coupon Styles ---
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
    // Removed borderTop and paddingTop here, moved to totalContainerWithCoupon
  },
  totalContainerWithCoupon: { // Added style for when coupon is applied
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    paddingTop: SPACING.MEDIUM,
  },
  totalLabel: {
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
    fontFamily: FONTS.INSTRUMENT_SANS, // Added font
  },
  totalPrice: {
    fontSize: FONT_SIZES.LARGE,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '700',
    fontFamily: FONTS.INSTRUMENT_SANS, // Added font
  },
  checkoutButton: {
    backgroundColor: COLORS.PRIMARY, // Changed to PRIMARY as per constants
    paddingVertical: SPACING.MEDIUM,
    borderRadius: 8,
    alignItems: 'center',
    height: 50, // Standard height
    justifyContent: 'center',
  },
  checkoutButtonDisabled: { // Style for disabled button
    backgroundColor: COLORS.TEXT_SECONDARY, // Use a grey color
    opacity: 0.7,
  },
  checkoutButtonText: {
    color: COLORS.BACKGROUND,
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '600',
    fontFamily: FONTS.INSTRUMENT_SANS, // Added font
  },
});