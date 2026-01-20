import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ApiPredefinedBox, ApiPerfumeSummary } from '../../src/services/api'; // Import API types
import { DecantSize } from '../../types/cart'; // Import DecantSize type
import { useCart } from '../../context/CartContext';
import { useSnackbar } from '../../context/SnackbarContext'; // Import useSnackbar hook
import { BasicPerfumeInfo } from '../../types/perfume'; // Keep BasicPerfumeInfo for cart item structure
import { COLORS, FONT_SIZES, SPACING } from '../../types/constants'; // Assuming constants exist

// Props definition for the modal
interface PredefinedBoxModalProps {
  isVisible: boolean;
  onClose: () => void;
  boxData: ApiPredefinedBox; // Use API type
  decantCount: 4 | 8;
}

const { height, width } = Dimensions.get('window');
const cardHeight = height * 0.2; // Adjust based on desired item height

const PredefinedBoxModal: React.FC<PredefinedBoxModalProps> = ({
  isVisible,
  onClose,
  boxData,
  decantCount,
}) => {
  const { addItemToCart } = useCart();
  const { showSnackbar } = useSnackbar(); // Add useSnackbar hook

  // Get the list of perfumes to display based on boxData and decantCount
  const perfumesToShow: ApiPerfumeSummary[] = useMemo(() => {
    // Use the perfumes array directly from the fetched boxData
    return boxData.perfumes.slice(0, decantCount);
  }, [boxData, decantCount]);

  // Calculate the total price for the displayed perfumes (fixed 5mL size)
  const totalPrice = useMemo(() => {
    // Calculate price based on the perfumes actually shown (ApiPerfumeSummary)
    return perfumesToShow.reduce((sum, perfume) => {
      return sum + (perfume.price_per_ml ?? 0) * 5; // Fixed 5mL size
    }, 0);
  }, [perfumesToShow]);

  // Handler for adding the predefined box to the cart
  const handleAddToCart = async () => {
    // Map ApiPerfumeSummary to BasicPerfumeInfo for cart context
    // Note: full_size_url is not available in ApiPerfumeSummary, so it will be null/undefined
    const perfumesInBox: BasicPerfumeInfo[] = perfumesToShow.map(p => ({
      id: String(p.id), // Convert number to string for BasicPerfumeInfo
      name: p.name,
      brand: p.brand,
      thumbnail_url: p.thumbnail_url ?? '', // Provide default empty string if null
      full_size_url: '', // Provide default empty string if null/not available
    }));

    const itemData = {
      productType: 'PREDEFINED_BOX' as const,
      name: `${boxData.title} (${decantCount} x 5ml)`,
      details: {
        decantCount: decantCount,
        decantSize: 5 as DecantSize, // Fixed size, cast to DecantSize
        perfumes: perfumesInBox,
      },
      price: totalPrice,
      thumbnail_url: perfumesInBox[0]?.thumbnail_url, // Use first perfume's image
      quantity: 1 as const,
    };

    try {
      await addItemToCart(itemData);
      console.log('Predefined Box added to cart:', itemData);

      // Show success snackbar at the top with redirect
      showSnackbar(
        'Se ha agregado el producto al carro.\nRedirigiendo al carro...',
        'success',
        2000,
        '/(tabs)/(cart)',
        'top'
      );

      onClose(); // Close the modal on success
    } catch (error) {
      console.error("Error adding Predefined Box to cart:", error);

      // Show error snackbar at the bottom
      showSnackbar(
        "Error al añadir al carrito.",
        'error',
        undefined,
        undefined,
        'bottom'
      );
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Close Button */}
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Feather name="chevron-down" size={28} color="#333" />
          </Pressable>

          <Text style={styles.modalTitle}>{boxData.title}</Text>
          <Text style={styles.modalSubtitle}>{`(${decantCount} x 5ml)`}</Text>

          <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
            {perfumesToShow.map((perfume) => (
              <View key={perfume.id} style={styles.perfumeCard}>
                {/* Content will be styled similar to PerfumeList item */}
                <View style={styles.imageContainer}>
                  <Image
                    // Comment removed to fix JSX syntax error
                    source={{ uri: perfume.thumbnail_url ?? undefined }}
                    style={styles.perfumeImage}
                  />
                  <Image
                    source={require('../../assets/images/decant-general.png')} // Ensure path is correct
                    style={styles.decantIcon}
                  />
                </View>
                <View style={styles.perfumeInfo}>
                  <Text style={styles.perfumeName}>{perfume.name}</Text>
                  <Text style={styles.perfumeBrand}>{perfume.brand}</Text>
                  <Text style={styles.perfumePrice}>${(perfume.price_per_ml ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}/mL</Text>
                  <Text style={styles.perfumeTotalPrice}>Total: ${((perfume.price_per_ml ?? 0) * 5).toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Footer with Price and Add to Cart Button */}
          <View style={styles.footer}>
            <View style={styles.priceContainer}>
              <Text style={styles.totalPriceLabel}>Precio Total:</Text>
              <Text style={styles.totalPriceValue}>${totalPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
            </View>
            <Pressable style={styles.addToCartButton} onPress={handleAddToCart}>
              <Text style={styles.addToCartButtonText}>Añadir al carro</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Basic Styles - Adapt from PerfumeList.tsx and PerfumeModal.tsx
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '85%', // Adjust height as needed
    paddingTop: 15,
    paddingHorizontal: SPACING.LARGE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  closeButton: {
    alignSelf: 'center',
    padding: 10,
    marginBottom: 5,
  },
  modalTitle: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginTop: SPACING.SMALL,
  },
  modalSubtitle: {
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  listContainer: {
    flex: 1, // Allows ScrollView to take available space
    marginBottom: SPACING.SMALL,
  },
  perfumeCard: { // Style similar to PerfumeList item
    flexDirection: 'row',
    padding: SPACING.MEDIUM,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: SPACING.MEDIUM,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    // height: cardHeight, // Optional fixed height
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER || '#F0F0F0', // Use existing BORDER constant
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    marginRight: SPACING.LARGE,
    alignItems: 'center', // Center image and icon
    justifyContent: 'center',
    width: cardHeight * 0.6, // Adjust width based on desired layout
    height: cardHeight * 0.6, // Adjust height
  },
  perfumeImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'contain',
  },
  decantIcon: {
    position: 'absolute',
    right: -15, // Adjust position
    bottom: -5, // Adjust position
    width: 25, // Adjust size
    height: 60, // Adjust size
    resizeMode: 'contain',
  },
  perfumeInfo: {
    flex: 1,
  },
  perfumeName: {
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  perfumeBrand: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
  },
  perfumePrice: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
    marginBottom: 4,
  },
  perfumeTotalPrice: {
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: 'bold',
    color: COLORS.ACCENT, // Use accent color
  },
  footer: {
    paddingTop: SPACING.MEDIUM,
    paddingBottom: SPACING.LARGE + 10, // Add extra padding for safe area
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER || '#EAEAEA', // Use existing BORDER constant
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flex: 1,
    marginRight: SPACING.MEDIUM,
  },
  totalPriceLabel: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 2,
  },
  totalPriceValue: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  addToCartButton: {
    backgroundColor: COLORS.ACCENT,
    paddingVertical: SPACING.MEDIUM,
    paddingHorizontal: SPACING.XLARGE,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 150, // Ensure button has decent width
  },
  addToCartButtonText: {
    color: COLORS.BACKGROUND, // White text
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: 'bold',
  },
});

export default PredefinedBoxModal;