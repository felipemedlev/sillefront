import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TouchableOpacity, Animated } from 'react-native'; // Import Alert
import { Feather } from '@expo/vector-icons';
import { useManualBox } from '../context/ManualBoxContext';
import { useCart } from '../context/CartContext'; // Import useCart
import { useSnackbar } from '../context/SnackbarContext'; // Import useSnackbar
import DecantSelector from '../components/product/DecantSelector';
import BottomBar from '../components/product/BottomBar';
import { COLORS, FONT_SIZES, SPACING } from '../types/constants';
import { Perfume, BasicPerfumeInfo } from '../types/perfume'; // Import BasicPerfumeInfo
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BoxVisualizer from '../components/product/BoxVisualizer'; // Import the new component

export default function ManualBoxScreen() {
  const insets = useSafeAreaInsets();
  const {
    selectedPerfumes, // These are full Perfume objects from ManualBoxContext
    decantCount,
    decantSize,
    setDecantCount,
    setDecantSize,
    removePerfume,
  } = useManualBox();
  const { addItemToCart } = useCart(); // Get cart function
  const { showSnackbar } = useSnackbar(); // Get showSnackbar function

  const calculateTotalPrice = useCallback(() => {
    // Add explicit types for reduce parameters
    return selectedPerfumes.reduce((total: number, perfume: Perfume) => {
      const price_per_ml = perfume.price_per_ml ?? 0;
      return total + price_per_ml * decantSize;
    }, 0);
  }, [selectedPerfumes, decantSize]);

  const handleAddToCart = useCallback(async () => {
    // Ensure the number of selected perfumes matches the decant count
    if (selectedPerfumes.length !== decantCount) {
      const errorMsg = `Debes seleccionar ${decantCount} perfumes (tienes ${selectedPerfumes.length}).`;

      // Use snackbar for error message at the bottom
      showSnackbar(errorMsg, 'error', undefined, undefined, 'bottom');

      console.log(`Cannot add manual box to cart. Expected ${decantCount} perfumes, got ${selectedPerfumes.length}.`);
      return; // Stop execution
    }

    const totalPrice = calculateTotalPrice();
    // Map full Perfume objects to BasicPerfumeInfo for the cart
    const perfumesInBox: BasicPerfumeInfo[] = selectedPerfumes.map(p => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      thumbnail_url: p.thumbnail_url,
      full_size_url: p.full_size_url,
    }));

    const itemData = {
      productType: 'BOX_PERSONALIZADO' as const,
      name: `Box Personalizado (${decantCount} x ${decantSize}ml)`,
      details: {
        decantCount,
        decantSize,
        perfumes: perfumesInBox,
      },
      price: totalPrice,
      thumbnail_url: perfumesInBox[0]?.thumbnail_url, // Use first perfume's image
    };

    try {
      await addItemToCart(itemData);
      console.log('Manual Box added to cart:', itemData);

      // Show success snackbar at the top with redirect
      showSnackbar(
        'Se ha agregado el producto al carro.\nRedirigiendo al carro...',
        'success',
        2000,
        '/(tabs)/(cart)',
        'top'
      );

    } catch (error) {
      console.error("Error adding Manual Box to cart:", error);

      // Use snackbar for error message at the bottom
      showSnackbar("Error al añadir al carrito.", 'error', undefined, undefined, 'bottom');
    }
  }, [
    decantCount,
    decantSize,
    selectedPerfumes,
    calculateTotalPrice,
    addItemToCart,
    showSnackbar,
  ]);

  const SelectedPerfumeItem = ({ perfume, index }: { perfume: Perfume; index: number }) => {
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const translateY = React.useRef(new Animated.Value(20)).current;

    React.useEffect(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, [fadeAnim, translateY]);

    // Handle case where brand might be an object instead of a string
    const brandDisplay = typeof perfume.brand === 'object' && perfume.brand !== null
      ? (perfume.brand as { name: string }).name || 'Unknown Brand'
      : perfume.brand;

    return (
      <Animated.View
        style={[
          styles.perfumeItem,
          {
            opacity: fadeAnim,
            transform: [{ translateY }],
          },
        ]}
      >
        <View style={styles.perfumeInfo}>
          <Text style={styles.perfumeBrand}>{brandDisplay}</Text>
          <Text style={styles.perfumeName}>{perfume.name}</Text>
          <Text style={styles.perfumePrice}>
            {((perfume.price_per_ml ?? 0) * decantSize).toLocaleString('de-DE')} por {decantSize}ml
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => removePerfume(perfume.id)}
          style={styles.removeButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="x-circle" size={24} color={COLORS.ERROR} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>Selecciona tu Box Personalizado</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Add the BoxVisualizer component here */}
        <BoxVisualizer decantCount={decantCount} decantSize={decantSize} />

        <DecantSelector
          decantCount={decantCount}
          onSelectDecant={setDecantCount}
          decantSize={decantSize}
          onDecantSize={setDecantSize}
          genderColors={COLORS.GIFTBOX.MALE}
        />

        <View style={styles.perfumeListContainer}>
          <Text style={styles.listHeader}>
            Perfumes Seleccionados ({selectedPerfumes.length}/{decantCount})
          </Text>
          {selectedPerfumes.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Feather name="info" size={40} color={COLORS.TEXT_SECONDARY} />
              <Text style={styles.emptyStateText}>
                Tu box manual está vacío.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/(search)')}
                style={styles.emptyStateButton}
              >
                <Text style={styles.emptyStateLink}>
                  Añade perfumes desde la pestaña de búsqueda (+)
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {selectedPerfumes.map((perfume: Perfume, index: number) => (
                <SelectedPerfumeItem key={perfume.id} perfume={perfume} index={index} />
              ))}
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/(search)')}
                style={styles.addMoreButton}
              >
                <Feather name="plus-circle" size={24} color={COLORS.ACCENT} />
                <Text style={styles.addMoreText}>Añadir más perfumes</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      <BottomBar
        totalPrice={calculateTotalPrice()}
        onAddToCart={handleAddToCart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_ALT, // Use a slightly different background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginLeft: 16,
  },
  scrollContent: {
    padding: SPACING.LARGE,
    paddingBottom: 120, // More space for BottomBar
  },
  title: {
    fontSize: FONT_SIZES.XLARGE,
    fontWeight: '800',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    flex: 1,
  },
  perfumeListContainer: {
    marginTop: SPACING.XLARGE,
  },
  listHeader: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MEDIUM,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.XLARGE,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    marginTop: SPACING.XLARGE,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginTop: SPACING.LARGE,
    marginBottom: SPACING.MEDIUM,
    lineHeight: FONT_SIZES.REGULAR * 1.5,
    maxWidth: '80%',
  },
  emptyStateButton: {
    backgroundColor: COLORS.ACCENT,
    paddingHorizontal: SPACING.LARGE,
    paddingVertical: SPACING.MEDIUM,
    borderRadius: 18,
    marginTop: SPACING.MEDIUM,
  },
  emptyStateLink: {
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.BACKGROUND,
    fontWeight: '600',
    textAlign: 'center',
  },
  perfumeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    padding: SPACING.LARGE,
    borderRadius: 12,
    marginBottom: SPACING.MEDIUM,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  perfumeInfo: {
    flex: 1,
    marginRight: SPACING.LARGE,
  },
  perfumeBrand: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    textTransform: 'uppercase',
    marginBottom: SPACING.XSMALL,
    letterSpacing: 0.5,
  },
  perfumeName: {
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XSMALL,
  },
  perfumePrice: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.ACCENT,
    fontWeight: '700',
  },
  removeButton: {
    padding: SPACING.SMALL,
    borderRadius: 20,
    backgroundColor: COLORS.BACKGROUND_ALT,
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.MEDIUM,
    borderRadius: 8,
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    marginTop: SPACING.SMALL,
  },
  addMoreText: {
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.ACCENT,
    fontWeight: '600',
    marginLeft: SPACING.SMALL,
  },
});