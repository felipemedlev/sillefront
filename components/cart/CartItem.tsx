import React, { useState } from 'react'; // Import useState
import { View, Text, StyleSheet, Image, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native'; // Import LayoutAnimation
import { Feather } from '@expo/vector-icons';
import { CartItem } from '../../types/cart';
import { COLORS, FONT_SIZES, SPACING } from '../../types/constants';
import { BasicPerfumeInfo } from '../../types/perfume'; // Import BasicPerfumeInfo

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CartItemProps {
  item: CartItem;
  onRemove: (itemId: string) => void;
}

const CartItemComponent: React.FC<CartItemProps> = ({ item, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(false); // State for expansion

  // Function to get a display name for the product type
  const getProductTypeName = (type: CartItem['productType']) => {
    switch (type) {
      case 'AI_BOX': return 'AI Discovery Box';
      case 'BOX_PERSONALIZADO': return 'Personalized Box';
      case 'GIFT_BOX': return 'Gift Box';
      case 'OCCASION_BOX': return 'Occasion Box';
      default: return 'Producto';
    }
  };

  const toggleExpand = () => {
    // Animate the layout change
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const renderPerfume = (perfume: BasicPerfumeInfo, index: number) => (
    <View key={perfume.id} style={styles.perfumeItem}>
      <Image source={{ uri: perfume.thumbnail_url }} style={styles.perfumeThumbnail} />
      <View style={styles.perfumeInfo}>
        <Text style={styles.perfumeBrand}>{perfume.brand}</Text>
        <Text style={styles.perfumeName}>{perfume.name}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.outerContainer}>
      <TouchableOpacity activeOpacity={0.7} onPress={toggleExpand} style={styles.touchableArea}>
        <View style={styles.container}>
          {/* <Image
            source={item.thumbnail_url ? { uri: item.thumbnail_url } : require('../../assets/images/decant-general.png')} // Fallback image
            style={styles.thumbnail}
            resizeMode="cover"
          /> */}
          <View style={styles.detailsContainer}>
            <Text style={styles.productType}>{getProductTypeName(item.productType)}</Text>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.boxDetails}>
              {item.details.decantCount} x {item.details.decantSize}ml
            </Text>
            <Text style={styles.price}>${item.price.toLocaleString('de-DE')}</Text>
          </View>
          <View style={styles.actionContainer}>
             <Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={COLORS.TEXT_SECONDARY} style={styles.expandIcon} />
             <TouchableOpacity
               style={styles.removeButton}
               onPress={() => onRemove(item.id)}
               hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
             >
               <Feather name="trash-2" size={20} color={COLORS.ERROR} />
             </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      {/* Expanded Content */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          <Text style={styles.perfumeListHeader}>Perfumes Incluidos:</Text>
          {item.details.perfumes.map(renderPerfume)}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    marginBottom: SPACING.MEDIUM,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden', // Important for LayoutAnimation
  },
  touchableArea: {
    // Takes the full width/height of the main container part
  },
  container: {
    flexDirection: 'row',
    padding: SPACING.MEDIUM,
    alignItems: 'center',
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: SPACING.MEDIUM,
    backgroundColor: COLORS.BACKGROUND_ALT, // Placeholder color
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  productType: {
    fontSize: FONT_SIZES.XSMALL,
    color: COLORS.TEXT_SECONDARY,
    textTransform: 'uppercase',
    marginBottom: SPACING.XSMALL,
    fontWeight: '500',
  },
  name: {
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XSMALL,
  },
  boxDetails: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.XSMALL,
  },
  price: {
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '700',
    color: COLORS.ACCENT, // Or PRIMARY
    marginTop: SPACING.XSMALL,
  },
  actionContainer: {
     alignItems: 'center',
     marginLeft: SPACING.SMALL,
  },
  expandIcon: {
     marginBottom: SPACING.MEDIUM, // Space between icons
  },
  removeButton: {
    padding: SPACING.SMALL,
  },
  // Expanded section styles
  expandedContent: {
    paddingHorizontal: SPACING.MEDIUM,
    paddingBottom: SPACING.MEDIUM,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    marginTop: SPACING.SMALL, // Space between main content and expanded
  },
  perfumeListHeader: {
    fontSize: FONT_SIZES.SMALL,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginTop: SPACING.SMALL,
    marginBottom: SPACING.MEDIUM,
  },
  perfumeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  perfumeThumbnail: {
    width: 30,
    height: 30,
    borderRadius: 4,
    marginRight: SPACING.SMALL,
    backgroundColor: COLORS.BACKGROUND_ALT,
  },
  perfumeInfo: {
    flex: 1,
  },
  perfumeBrand: {
    fontSize: FONT_SIZES.XSMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  perfumeName: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_PRIMARY,
  },
});

export default CartItemComponent;