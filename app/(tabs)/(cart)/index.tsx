import React, { useCallback, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../src/context/AuthContext';
import { CartItem } from '../../../types/cart';
import { Coupon } from '../../../types/coupon';
import CartItemComponent from '../../../components/cart/CartItem';
import { COLORS, FONT_SIZES, SPACING, FONTS } from '../../../types/constants';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRouter, useFocusEffect } from 'expo-router';

// --- CartFooter Component ---
interface CartFooterProps {
  totalCartItems: number;
  finalPrice: number;
  discountAmount: number;
  appliedCoupon: Coupon | null;
  couponError: string | null;
  isAuthLoading: boolean;
  isCartLoading: boolean;
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
  isCartLoading,
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

  const tabBarHeightEstimate = 60;
  const totalBottomPadding = insets.bottom + tabBarHeightEstimate + SPACING.MEDIUM;

  const isCheckoutDisabled = totalCartItems === 0 || isAuthLoading;

  return (
    <View style={{ paddingBottom: totalBottomPadding }}>
      <View style={styles.footer}>

        {totalCartItems > 0 && (
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
                    autoCapitalize="characters"
                    editable={!isCartLoading}
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

        <View style={[styles.totalContainer, appliedCoupon && styles.totalContainerWithCoupon]}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalPrice}>${finalPrice.toLocaleString('de-DE')}</Text>
        </View>

        <TouchableOpacity
          style={[styles.checkoutButton, isCheckoutDisabled && styles.checkoutButtonDisabled]}
          onPress={onCheckoutPress}
          disabled={isCheckoutDisabled}
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
});


// --- CartScreen Component ---
export default function CartScreen() {
  const router = useRouter();
  const lastRefreshTime = useRef(0);
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
    refreshCart,
  } = useCart();

  const DESKTOP_BREAKPOINT = 768;
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigation = useNavigation();

  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      const timeSinceLastRefresh = now - lastRefreshTime.current;
      
      // Only refresh if it's been more than 2 seconds since last refresh
      // and we're not currently loading (to avoid conflicts with ongoing operations)
      if (!isCartLoading && timeSinceLastRefresh > 2000) {
        lastRefreshTime.current = now;
        refreshCart();
      }
    }, [refreshCart, isCartLoading])
  );

  const handleCheckoutPress = useCallback(() => {
    if (user) {
      router.push({
        pathname: '/checkout',
        params: { finalPrice: finalPrice },
      });
    } else {
      // Store checkout intent before redirecting to auth
      router.push({
        pathname: '/signup',
        params: { 
          returnUrl: 'checkout',
          finalPrice: finalPrice.toString()
        }
      });
    }
  }, [user, finalPrice, router]);

  const renderCartItem = useCallback(({ item }: { item: CartItem }) => (
    <CartItemComponent item={item} onRemove={removeItemFromCart} />
  ), [removeItemFromCart]);

  const renderEmptyCart = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Feather name="shopping-cart" size={60} color={COLORS.TEXT_SECONDARY} />
      <Text style={styles.emptyText}>Tu carrito está vacío.</Text>
      <Text style={styles.emptySubText}>Añade algunos perfumes para empezar.</Text>
    </View>
  ), []);

  const renderHeader = useCallback(() => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Carrito ({totalCartItems})</Text>
      {totalCartItems > 0 && (
        <TouchableOpacity onPress={clearCart} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Vaciar Carrito</Text>
        </TouchableOpacity>
      )}
    </View>
  ), [totalCartItems, clearCart]);

  if (isCartLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Cargando Carrito...</Text>
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
        {isDesktop && <View style={{ marginTop: 80 }} />}
        {renderHeader()}
        {cartItems.length === 0 ? (
          renderEmptyCart()
        ) : (
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id}
            ListFooterComponent={
              <CartFooter
                totalCartItems={totalCartItems}
                finalPrice={finalPrice}
                discountAmount={discountAmount}
                appliedCoupon={appliedCoupon}
                couponError={couponError}
                isAuthLoading={isAuthLoading}
                isCartLoading={isCartLoading}
                applyCoupon={applyCoupon}
                removeCoupon={removeCoupon}
                onCheckoutPress={handleCheckoutPress}
              />
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          />
        )}
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFEFC',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
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
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  clearButton: {
    padding: SPACING.SMALL,
  },
  clearButtonText: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.ERROR,
    fontWeight: '500',
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  listContent: {
    paddingHorizontal: SPACING.MEDIUM,
    paddingTop: SPACING.MEDIUM,
    paddingBottom: SPACING.MEDIUM,
  },
  loadingText: {
    marginTop: SPACING.MEDIUM,
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  errorText: {
    marginTop: SPACING.MEDIUM,
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.ERROR,
    textAlign: 'center',
    paddingHorizontal: SPACING.LARGE,
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.XLARGE,
  },
  emptyText: {
    marginTop: SPACING.LARGE,
    fontSize: FONT_SIZES.LARGE,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  emptySubText: {
    marginTop: SPACING.SMALL,
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  footer: {
    backgroundColor: COLORS.BACKGROUND,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    paddingHorizontal: SPACING.LARGE,
    paddingTop: SPACING.MEDIUM,
  },
  couponSection: {
    marginBottom: SPACING.LARGE,
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
    paddingVertical: SPACING.SMALL,
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.TEXT_PRIMARY,
    marginRight: SPACING.SMALL,
    height: 44,
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  applyCouponButton: {
    backgroundColor: COLORS.ACCENT,
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL,
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
  },
  applyCouponButtonDisabled: {
    backgroundColor: COLORS.BORDER,
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
    backgroundColor: '#E8F5E9',
    padding: SPACING.MEDIUM,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  appliedCouponLabel: {
    fontSize: FONT_SIZES.SMALL,
    color: '#2E7D32',
    fontFamily: FONTS.INSTRUMENT_SANS,
    marginBottom: SPACING.XSMALL,
  },
  appliedCouponCode: {
    fontSize: FONT_SIZES.REGULAR,
    color: '#1B5E20',
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
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  totalContainerWithCoupon: {
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    paddingTop: SPACING.MEDIUM,
  },
  totalLabel: {
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  totalPrice: {
    fontSize: FONT_SIZES.LARGE,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '700',
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  checkoutButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.MEDIUM,
    borderRadius: 8,
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
  },
  checkoutButtonDisabled: {
    backgroundColor: COLORS.TEXT_SECONDARY,
    opacity: 0.7,
  },
  checkoutButtonText: {
    color: COLORS.BACKGROUND,
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '600',
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
});