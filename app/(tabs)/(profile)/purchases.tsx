import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, LayoutAnimation, Platform, UIManager, Image } from 'react-native'; // Added Image
import { MOCK_PURCHASES, Purchase, PurchaseItem } from '../../../data/mockPurchases';
import { BasicPerfumeInfo } from '../../../types/perfume'; // Import BasicPerfumeInfo
import { COLORS, FONTS, SPACING, FONT_SIZES } from '../../../types/constants';
import { Feather } from '@expo/vector-icons';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Component to render a single purchase item in the list
const PurchaseListItem: React.FC<{ item: Purchase }> = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false); // State for expansion

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const getStatusStyle = (status: Purchase['status']) => {
    switch (status) {
      case 'Entregado':
        return styles.statusDelivered;
      case 'En Camino':
        return styles.statusShipped;
      case 'Procesando':
        return styles.statusProcessing;
      default:
        return {};
    }
  };

  // Helper to render individual PERFUMES in the expanded view
  const renderPerfumeDetail = (perfume: BasicPerfumeInfo, index: number) => (
     <View key={perfume.id || index} style={styles.perfumeItem}>
       <Image source={{ uri: perfume.thumbnail_url }} style={styles.perfumeThumbnail} />
       <View style={styles.perfumeInfo}>
         <Text style={styles.perfumeBrand}>{perfume.brand}</Text>
         <Text style={styles.perfumeName}>{perfume.name}</Text>
       </View>
     </View>
  );


  return (
    <View style={styles.itemContainer}>
       {/* Make the main row touchable to toggle expansion */}
      <TouchableOpacity activeOpacity={0.7} onPress={toggleExpand} style={styles.touchableRow}>
        <View style={styles.mainRow}>
            {/* Left side: Order Info & Summary */}
            <View style={styles.infoColumn}>
                <View style={styles.itemHeader}>
                    <Text style={styles.orderId}>Orden #{item.id.replace('ORD-', '')}</Text>
                    <Text style={styles.date}>{item.date}</Text>
                </View>
                 {/* Display Summary Item Name(s) Here */}
                 <Text style={styles.itemSummary} numberOfLines={2} ellipsizeMode="tail">
                    {item.items.map(p => `${p.quantity}x ${p.name}`).join(' + ')}
                 </Text>
                <View style={styles.itemBody}>
                    <Text style={styles.totalPrice}>
                    Total: ${item.totalPrice.toLocaleString('es-CL')}
                    </Text>
                </View>
            </View>
            {/* Right side: Status and Expand Icon */}
            <View style={styles.statusExpandColumn}>
                <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
                 <Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={24} color={COLORS.TEXT_SECONDARY} style={styles.expandIcon} />
            </View>
        </View>
      </TouchableOpacity>

      {/* Conditionally render the expanded content */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          <Text style={styles.detailHeader}>Perfumes Incluidos:</Text>
          {/* Iterate through items and then their perfumes */}
          {item.items.flatMap(purchaseItem => purchaseItem.perfumes || []).map(renderPerfumeDetail)}
          {/* Handle case where no perfumes are listed */}
          {item.items.every(purchaseItem => !purchaseItem.perfumes || purchaseItem.perfumes.length === 0) && (
             <Text style={styles.noPerfumeText}>No hay detalles de perfumes disponibles para este pedido.</Text>
          )}
        </View>
      )}
    </View>
  );
};

export default function PurchasesScreen() {
  return (
    <View style={styles.container}>
      {MOCK_PURCHASES.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="shopping-bag" size={60} color={COLORS.TEXT_SECONDARY} />
          <Text style={styles.emptyText}>Aún no tienes compras registradas.</Text>
          {/* Optional: Add a button to browse products */}
        </View>
      ) : (
        <FlatList
          data={MOCK_PURCHASES}
          renderItem={({ item }) => <PurchaseListItem item={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContentContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  listContentContainer: {
    padding: SPACING.MEDIUM,
    marginBottom: 50,
  },
  itemContainer: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 10,
    padding: 0, // Remove padding from outer container
    marginBottom: SPACING.MEDIUM,
    // Add shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden', // Needed for LayoutAnimation and border radius
  },
  touchableRow: {
    // Style for the touchable area covering the main row
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Align items vertically in the center of the row
    padding: SPACING.MEDIUM, // Add padding inside the row
  },
  infoColumn: {
    flex: 1,
    marginRight: SPACING.MEDIUM, // Increased space
  },
  statusExpandColumn: {
    alignItems: 'flex-end', // Align items to the right
    justifyContent: 'space-between', // Space badge and icon vertically
    // minHeight removed, height determined by content
  },
  expandIcon: {
     // No specific margin needed now, alignment handles it
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.SMALL,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    paddingBottom: SPACING.SMALL,
    // Removed borderBottomWidth and borderBottomColor here, applied to expandedContent instead if needed
  },
  orderId: {
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '600',
    fontFamily: FONTS.INSTRUMENT_SANS,
    color: COLORS.TEXT_PRIMARY,
  },
  date: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONTS.INSTRUMENT_SANS,
    color: COLORS.TEXT_SECONDARY,
  },
  itemBody: {
    marginBottom: SPACING.MEDIUM,
  },
  itemSummary: {
    fontSize: FONT_SIZES.SMALL,
    fontFamily: FONTS.INSTRUMENT_SANS,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.XSMALL,
  },
  totalPrice: {
    fontSize: FONT_SIZES.REGULAR,
    // fontWeight: '700', // Removed duplicate
    fontFamily: FONTS.INSTRUMENT_SANS,
    color: COLORS.TEXT_PRIMARY, // Use primary text color for total price for better contrast/Airbnb style
    fontWeight: '600', // Slightly less bold
  },
  statusBadge: {
    // Removed absolute positioning
    paddingHorizontal: SPACING.MEDIUM, // More horizontal padding
    paddingVertical: SPACING.XSMALL + 1, // Slightly more vertical padding
    borderRadius: 12, // More rounded corners
    marginBottom: SPACING.MEDIUM, // Space between badge and icon
    alignSelf: 'flex-end', // Ensure it stays to the right within its column
  },
  statusText: {
    fontSize: FONT_SIZES.XSMALL,
    fontWeight: '600',
    fontFamily: FONTS.INSTRUMENT_SANS,
    color: COLORS.BACKGROUND, // White text on colored badge
  },
  statusDelivered: {
    backgroundColor: COLORS.SUCCESS, // Green
  },
  statusShipped: {
    backgroundColor: '#FFA000', // Orange/Amber
  },
  statusProcessing: {
    backgroundColor: '#1976D2', // Blue
  },
  separator: {
    height: SPACING.MEDIUM, // Use margin bottom on items instead
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.LARGE,
  },
  emptyText: {
    marginTop: SPACING.MEDIUM,
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: FONTS.INSTRUMENT_SANS,
    textAlign: 'center',
  },
  // detailsIndicator: { // Optional style
  //   position: 'absolute',
  //   right: SPACING.MEDIUM,
  //   bottom: SPACING.MEDIUM,
  // },
  // Styles for Expanded Content
  expandedContent: {
    paddingHorizontal: SPACING.MEDIUM,
    paddingBottom: SPACING.MEDIUM,
    paddingTop: SPACING.SMALL, // Add some top padding
    borderTopWidth: 1, // Separator line
    borderTopColor: COLORS.BORDER,
    backgroundColor: COLORS.BACKGROUND, // Use main background for consistency inside the card
  },
  detailHeader: {
    fontSize: FONT_SIZES.REGULAR, // Slightly larger header for details
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SMALL,
    marginTop: SPACING.XSMALL,
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.XSMALL,
    paddingLeft: SPACING.MEDIUM, // Increased indent
  },
  detailItemText: {
    fontSize: FONT_SIZES.REGULAR, // Slightly larger text for details
    color: COLORS.TEXT_SECONDARY,
    fontFamily: FONTS.INSTRUMENT_SANS,
    flex: 1, // Allow text to wrap
    marginRight: SPACING.SMALL,
  },
  detailItemPrice: {
    fontSize: FONT_SIZES.SMALL, // Slightly larger price
    color: COLORS.TEXT_SECONDARY,
    fontFamily: FONTS.INSTRUMENT_SANS,
    fontWeight: '500',
  },
   // Styles for Expanded Perfume Details
   perfumeItem: {
     flexDirection: 'row',
     alignItems: 'center',
     marginBottom: SPACING.MEDIUM, // Space between perfume items
   },
   perfumeThumbnail: {
     width: 40,
     height: 40,
     borderRadius: 6,
     marginRight: SPACING.MEDIUM,
     backgroundColor: COLORS.BACKGROUND_ALT, // Placeholder bg
   },
   perfumeInfo: {
     flex: 1,
   },
   perfumeBrand: {
     fontSize: FONT_SIZES.XSMALL,
     color: COLORS.TEXT_SECONDARY,
     fontFamily: FONTS.INSTRUMENT_SANS,
     marginBottom: 2,
   },
   perfumeName: {
     fontSize: FONT_SIZES.SMALL,
     color: COLORS.TEXT_PRIMARY,
     fontFamily: FONTS.INSTRUMENT_SANS,
     fontWeight: '500',
   },
   noPerfumeText: {
       fontSize: FONT_SIZES.SMALL,
       color: COLORS.TEXT_SECONDARY,
       fontFamily: FONTS.INSTRUMENT_SANS,
       fontStyle: 'italic',
       textAlign: 'center',
       marginTop: SPACING.SMALL,
   }
});