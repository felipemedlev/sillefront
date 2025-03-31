import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native'; // Removed ScrollView as FlatList handles scrolling
import { useCart } from '../../../context/CartContext';
import { CartItem } from '../../../types/cart';
import CartItemComponent from '../../../components/cart/CartItem';
import { COLORS, FONT_SIZES, SPACING } from '../../../types/constants';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function CartScreen() {
  const router = useRouter();
  const {
    cartItems,
    isLoading,
    error,
    removeItemFromCart,
    clearCart,
    totalCartPrice,
    totalCartItems,
  } = useCart();
  const insets = useSafeAreaInsets();

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

    return (
      // Add a wrapper View to apply padding below the actual footer content
      <View style={{ paddingBottom: totalBottomPadding }}>
        <View style={styles.footer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalPrice}>${totalCartPrice.toLocaleString('de-DE')}</Text>
          </View>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => router.push('/checkout')}
          >
            <Text style={styles.checkoutButtonText}>Continuar al pago</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Cargando carrito...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Feather name="alert-circle" size={40} color={COLORS.ERROR} />
        <Text style={styles.errorText}>Error al cargar el carrito: {error}</Text>
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
        /* Remove the separate footer View here */
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
  },
  clearButton: {
    padding: SPACING.SMALL,
  },
  clearButtonText: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.ERROR,
    fontWeight: '500',
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
  },
  errorText: {
    marginTop: SPACING.MEDIUM,
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.ERROR,
    textAlign: 'center',
    paddingHorizontal: SPACING.LARGE,
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
  },
  emptySubText: {
    marginTop: SPACING.SMALL,
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
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
  },
  totalPrice: {
    fontSize: FONT_SIZES.LARGE,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '700',
  },
  checkoutButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.MEDIUM,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: COLORS.BACKGROUND,
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '600',
  },
});