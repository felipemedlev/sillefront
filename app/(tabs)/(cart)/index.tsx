import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext'; // Import useAuth
import { CartItem } from '../../../types/cart';
import CartItemComponent from '../../../components/cart/CartItem';
import { COLORS, FONT_SIZES, SPACING, FONTS } from '../../../types/constants'; // Added FONTS
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function CartScreen() {
  const router = useRouter();
  const {
    cartItems,
    isLoading: isCartLoading, // Renamed to avoid conflict
    error: cartError, // Renamed to avoid conflict
    removeItemFromCart,
    clearCart,
    totalCartPrice,
    totalCartItems,
  } = useCart();
  const { user, isLoading: isAuthLoading } = useAuth(); // Get user and auth loading state
  const insets = useSafeAreaInsets();

  const handleCheckoutPress = () => {
    if (user) {
      router.push('/checkout'); // Navigate to checkout if logged in
    } else {
      router.push('/auth/signup'); // Navigate to signup if not logged in
    }
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <CartItemComponent item={item} onRemove={removeItemFromCart} />
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Feather name="shopping-cart" size={60} color={COLORS.TEXT_SECONDARY} />
      <Text style={styles.emptyText}>Tu carrito está vacío.</Text>
      <Text style={styles.emptySubText}>Añade algunos perfumes para empezar.</Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Carrito ({totalCartItems})</Text>
      {totalCartItems > 0 && (
        <TouchableOpacity onPress={clearCart} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Vaciar Carrito</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Define the footer component to be rendered by FlatList
  const renderFooter = () => {
    // Estimate Tab Bar height (adjust if necessary)
    const tabBarHeightEstimate = 60;
    const totalBottomPadding = insets.bottom + tabBarHeightEstimate + SPACING.MEDIUM;

    // Disable button if cart is empty or auth is loading
    const isCheckoutDisabled = totalCartItems === 0 || isAuthLoading;

    return (
      // Add a wrapper View to apply padding below the actual footer content
      <View style={{ paddingBottom: totalBottomPadding }}>
        <View style={styles.footer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalPrice}>${totalCartPrice.toLocaleString('de-DE')}</Text>
          </View>
          <TouchableOpacity
            style={[styles.checkoutButton, isCheckoutDisabled && styles.checkoutButtonDisabled]}
            onPress={handleCheckoutPress} // Use the new handler
            disabled={isCheckoutDisabled} // Disable button when appropriate
            activeOpacity={0.8}
          >
            {isAuthLoading ? (
              <ActivityIndicator color={COLORS.BACKGROUND} />
            ) : (
              <Text style={styles.checkoutButtonText}>Continuar al pago</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Show loading indicator if either cart or auth is loading
  if (isCartLoading || isAuthLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

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
      {renderHeader()}
      {cartItems.length === 0 ? (
        renderEmptyCart()
      ) : (
        <FlatList
          data={cartItems}
          renderItem={renderCartItem}
          keyExtractor={(item) => item.id}
          ListFooterComponent={renderFooter} // Use the footer component here
          contentContainerStyle={styles.listContent} // Padding for items
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }} // Allow FlatList to take available space
        />
      )}
    </View>
  );
}

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
  errorText: {
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
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
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