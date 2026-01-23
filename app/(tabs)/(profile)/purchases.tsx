import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, LayoutAnimation, Platform, UIManager, Image, ActivityIndicator } from 'react-native';
import { ApiOrder, fetchOrders } from '../../../src/services/api';
import { COLORS, FONTS, SPACING, FONT_SIZES } from '../../../types/constants';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../../src/context/AuthContext';
import { useFocusEffect } from 'expo-router';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Component to render a single purchase item in the list
const PurchaseListItem: React.FC<{ item: ApiOrder }> = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'entregado':
        return styles.statusDelivered;
      case 'shipped':
      case 'en camino':
        return styles.statusShipped;
      case 'processing':
      case 'pending':
      case 'procesando':
        return styles.statusProcessing;
      default:
        return {};
    }
  };

  const getStatusLabel = (status: string) => {
    // Normalize status to lowercase for comparison if needed, or handle as is
    const s = status.toLowerCase();
    if (s === 'delivered' || s === 'entregado') return 'Entregado';
    if (s === 'shipped' || s === 'en camino') return 'En Camino';
    if (s === 'processing' || s === 'procesando') return 'Procesando';
    if (s === 'pending') return 'Pendiente';
    if (s === 'cancelled') return 'Cancelado';
    return status;
  };

  const renderPerfumeDetail = (perfume: any, index: number) => {
    if (!perfume) return null;
    return (
      <View key={perfume.id || index} style={styles.perfumeItem}>
        <Image source={{ uri: perfume.thumbnail_url }} style={styles.perfumeThumbnail} />
        <View style={styles.perfumeInfo}>
          <Text style={styles.perfumeBrand}>{perfume.brand}</Text>
          <Text style={styles.perfumeName}>{perfume.name}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.itemContainer}>
      <TouchableOpacity activeOpacity={0.7} onPress={toggleExpand} style={styles.touchableRow}>
        <View style={styles.mainRow}>
          <View style={styles.infoColumn}>
            <View style={styles.itemHeader}>
              <Text style={styles.orderId}>Orden #{item.id}</Text>
              <Text style={styles.date}>{new Date(item.order_date).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.itemSummary} numberOfLines={2} ellipsizeMode="tail">
              {item.items.map(p => `${p.quantity}x ${p.item_name || p.product_type || 'Item'}`).join(' + ')}
            </Text>
            <View style={styles.itemBody}>
              <Text style={styles.totalPrice}>
                Total: ${parseFloat(item.total_price).toLocaleString('es-CL')}
              </Text>
            </View>
          </View>
          <View style={styles.statusExpandColumn}>
            <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
              <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
            </View>
            <Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={24} color={COLORS.TEXT_SECONDARY} style={styles.expandIcon} />
          </View>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <Text style={styles.detailHeader}>Detalles del Pedido:</Text>
          {item.items.map((orderItem, idx) => (
            <View key={idx} style={{ marginBottom: 10 }}>
              <Text style={{ fontWeight: 'bold' }}>{orderItem.item_name || 'Producto'}</Text>
              <Text style={{ color: 'gray' }}>Cantidad: {orderItem.quantity}</Text>
              {orderItem.perfume && renderPerfumeDetail(orderItem.perfume, idx)}
              {orderItem.box_configuration && orderItem.box_configuration.perfumes &&
                Array.isArray(orderItem.box_configuration.perfumes) &&
                orderItem.box_configuration.perfumes.map((p: any, pIdx: number) => renderPerfumeDetail(p, pIdx))
              }
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default function PurchasesScreen() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadOrders = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await fetchOrders();
      setOrders(data);
    } catch (error) {
      console.error("Failed to load orders", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadOrders();
    }, [user])
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.ACCENT} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="shopping-bag" size={60} color={COLORS.TEXT_SECONDARY} />
          <Text style={styles.emptyText}>Aún no tienes compras registradas.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={({ item }) => <PurchaseListItem item={item} />}
          keyExtractor={(item) => item.id.toString()}
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
    backgroundColor: '#FFFEFC',
  },
  listContentContainer: {
    padding: SPACING.MEDIUM,
    marginBottom: 50,
  },
  itemContainer: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 10,
    padding: 0,
    marginBottom: SPACING.MEDIUM,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  touchableRow: {
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.MEDIUM,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoColumn: {
    flex: 1,
    marginRight: SPACING.MEDIUM,
  },
  statusExpandColumn: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  expandIcon: {
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.SMALL,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    paddingBottom: SPACING.SMALL,
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
    fontFamily: FONTS.INSTRUMENT_SANS,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.XSMALL + 1,
    borderRadius: 12,
    marginBottom: SPACING.MEDIUM,
    alignSelf: 'flex-end',
  },
  statusText: {
    fontSize: FONT_SIZES.XSMALL,
    fontWeight: '600',
    fontFamily: FONTS.INSTRUMENT_SANS,
    color: COLORS.BACKGROUND,
  },
  statusDelivered: {
    backgroundColor: COLORS.SUCCESS,
  },
  statusShipped: {
    backgroundColor: '#FFA000',
  },
  statusProcessing: {
    backgroundColor: '#1976D2',
  },
  separator: {
    height: SPACING.MEDIUM,
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
  expandedContent: {
    paddingHorizontal: SPACING.MEDIUM,
    paddingBottom: SPACING.MEDIUM,
    paddingTop: SPACING.SMALL,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    backgroundColor: COLORS.BACKGROUND,
  },
  detailHeader: {
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SMALL,
    marginTop: SPACING.XSMALL,
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  perfumeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  perfumeThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: SPACING.MEDIUM,
    backgroundColor: '#FFFEFC',
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
});