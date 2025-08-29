import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform, Alert, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, FONTS, STORAGE_KEYS } from '../types/constants';
import { useAuth } from '../src/context/AuthContext';
import { useCart } from '../context/CartContext';
import { ActivityIndicator } from 'react-native';
import { placeOrder, ApiOrderCreatePayload, ApiOrder } from '../src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { finalPrice } = useLocalSearchParams<{ finalPrice?: string }>();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { handleSuccessfulOrder } = useCart();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const finalPriceValue = finalPrice ? parseFloat(finalPrice) : 0;

  if (isAuthLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (!user && !isAuthLoading) {
    // If user is not authenticated and not loading, redirect to login with checkout return intent
    router.replace({
      pathname: '/login',
      params: { 
        returnUrl: 'checkout',
        finalPrice: finalPrice || '0'
      }
    });
    return null;
  }

  // Show loading while user context is loading after authentication
  if (!user && isAuthLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }


  const handlePlaceOrder = async () => {
    if (!user) {
      Alert.alert("Error", "Debes iniciar sesión para realizar un pedido.");
      router.push({
        pathname: '/login',
        params: { 
          returnUrl: 'checkout',
          finalPrice: finalPrice || '0'
        }
      });
      return;
    }

    const testShippingAddress = "Test Address 123, Test Commune, Test City";

    setIsPlacingOrder(true);
    setOrderError(null);

    const payload: ApiOrderCreatePayload = {
      shipping_address: testShippingAddress,
    };

    try {
      const order: ApiOrder = await placeOrder(payload);
      console.log('Order placed successfully:', order);

      // Store perfume IDs for rating
      if (order && order.items) {
        const perfumeExternalIds = new Set<string>();
        order.items.forEach(orderItem => {
          if (orderItem.box_configuration?.perfumes && Array.isArray(orderItem.box_configuration.perfumes)) {
            orderItem.box_configuration.perfumes.forEach((p: any) => {
              if (p.external_id) {
                perfumeExternalIds.add(p.external_id);
              }
            });
          } else if (orderItem.perfume?.external_id) {
            perfumeExternalIds.add(orderItem.perfume.external_id);
          }
        });

        if (perfumeExternalIds.size > 0) {
          try {
            const existingIdsJson = await AsyncStorage.getItem(STORAGE_KEYS.ORDERED_PERFUMES_FOR_RATING);
            if (existingIdsJson) {
              const existingIdsArray = JSON.parse(existingIdsJson);
              if (Array.isArray(existingIdsArray)) {
                existingIdsArray.forEach(id => perfumeExternalIds.add(id));
              }
            }
            await AsyncStorage.setItem(STORAGE_KEYS.ORDERED_PERFUMES_FOR_RATING, JSON.stringify(Array.from(perfumeExternalIds)));
            console.log('Stored perfume IDs for rating:', Array.from(perfumeExternalIds));
          } catch (e) {
            console.error("Error storing ordered perfume IDs for rating:", e);
          }
        }
      }

      handleSuccessfulOrder();
      setShowSuccessModal(true);
      // router.replace('/home'); // Navigation will be handled by the modal's close button
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

      <ScrollView style={styles.contentScrollView} contentContainerStyle={styles.contentContainer}>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Método de Pago</Text>
          <TouchableOpacity style={styles.paymentButton}>
             <Text style={styles.paymentButtonText}>Agregar Método de Pago</Text>
          </TouchableOpacity>
        </View>

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

      <Modal
        animationType="fade"
        transparent={true}
        visible={showSuccessModal}
        onRequestClose={() => {
          setShowSuccessModal(!showSuccessModal);
          router.replace('/home');
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Feather name="check-circle" size={60} color={COLORS.SUCCESS} style={{ marginBottom: SPACING.MEDIUM }} />
            <Text style={styles.modalTitle}>¡Pedido Realizado!</Text>
            <Text style={styles.modalText}>Tu pedido ha sido procesado con éxito.</Text>
            <Text style={styles.modalText}>Recibirás una confirmación por correo electrónico en breve.</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowSuccessModal(!showSuccessModal);
                router.replace('/home');
              }}
            >
              <Text style={styles.modalButtonText}>Continuar Comprando</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.MEDIUM,
    backgroundColor: COLORS.BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  backButton: {
    padding: SPACING.SMALL,
    marginRight: SPACING.SMALL,
  },
  headerTitle: {
    fontSize: FONT_SIZES.XLARGE,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    flex: 1,
  },
  subscriptionBanner: {
    backgroundColor: '#4A4A4A',
    paddingVertical: SPACING.LARGE,
    paddingHorizontal: SPACING.LARGE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: SPACING.MEDIUM,
    marginHorizontal: SPACING.MEDIUM,
    marginTop: SPACING.LARGE,
    marginBottom: SPACING.MEDIUM,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  bannerTextContainer: {
    flex: 1,
    marginRight: SPACING.MEDIUM,
    alignItems: 'center',
  },
  bannerHeadline: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.LARGE,
    fontWeight: 'bold',
    marginBottom: SPACING.XSMALL,
  },
  bannerSubHeadline: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.REGULAR,
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  contentScrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.LARGE,
  },
  section: {
    backgroundColor: COLORS.BACKGROUND_ALT || '#F5F5F5',
    borderRadius: SPACING.MEDIUM,
    padding: SPACING.LARGE,
    marginBottom: SPACING.LARGE,
    ...Platform.select({
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
    fontSize: FONT_SIZES.LARGE,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.LARGE,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_ALT,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: SPACING.SMALL,
    paddingHorizontal: SPACING.MEDIUM,
    marginBottom: SPACING.MEDIUM,
  },
  inputIconStyle: {
    marginRight: SPACING.MEDIUM,
  },
  textInputStyle: {
    flex: 1,
    paddingVertical: SPACING.MEDIUM,
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.TEXT_PRIMARY,
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  paymentButton: {
    borderColor: COLORS.PRIMARY,
    borderWidth: 1.5,
    paddingVertical: SPACING.MEDIUM,
    paddingHorizontal: SPACING.LARGE,
    borderRadius: SPACING.SMALL,
    alignItems: 'center',
    marginTop: SPACING.MEDIUM,
  },
  paymentButtonText: {
    color: COLORS.PRIMARY,
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.MEDIUM,
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
    borderTopColor: COLORS.BORDER,
    marginTop: SPACING.SMALL,
    paddingTop: SPACING.LARGE,
  },
  summaryTotalLabel: {
    fontSize: FONT_SIZES.LARGE,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: 'bold',
  },
  summaryTotalValue: {
    fontSize: FONT_SIZES.LARGE,
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  footer: {
    paddingHorizontal: SPACING.MEDIUM,
    paddingTop: SPACING.MEDIUM,
    paddingBottom: Platform.OS === 'ios' ? SPACING.XLARGE : SPACING.LARGE,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    backgroundColor: COLORS.BACKGROUND,
  },
  placeOrderButton: {
    backgroundColor: '#000000',
    paddingVertical: SPACING.LARGE,
    paddingHorizontal: SPACING.LARGE,
    borderRadius: SPACING.MEDIUM,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  placeOrderButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.LARGE,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.TEXT_PRIMARY,
    marginTop: SPACING.MEDIUM,
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  errorText: {
    color: COLORS.ERROR,
    textAlign: 'center',
    marginTop: SPACING.MEDIUM,
    fontSize: FONT_SIZES.REGULAR,
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: SPACING.MEDIUM,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: SPACING.LARGE,
    padding: SPACING.XLARGE,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '85%',
  },
  modalTitle: {
    fontSize: FONT_SIZES.XLARGE,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MEDIUM,
    textAlign: 'center',
  },
  modalText: {
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.SMALL,
    textAlign: 'center',
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  modalButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: SPACING.MEDIUM,
    paddingVertical: SPACING.MEDIUM,
    paddingHorizontal: SPACING.XLARGE,
    elevation: 2,
    marginTop: SPACING.LARGE,
  },
  modalButtonText: {
    color: COLORS.BACKGROUND,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: FONT_SIZES.LARGE,
  }
});