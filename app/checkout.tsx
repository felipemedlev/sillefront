import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../types/constants';

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // TODO: Add checkout logic (address, payment, order summary)

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
         <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
           <Feather name="arrow-left" size={24} color={COLORS.TEXT_PRIMARY} />
         </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        {/* Add placeholder for potential header actions */}
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.placeholderText}>Checkout Screen Placeholder</Text>
        <Text style={styles.todoText}>Implement address form, payment integration, and order summary here.</Text>
        {/* Add more placeholder UI elements as needed */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_ALT,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.MEDIUM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    backgroundColor: COLORS.BACKGROUND,
  },
   backButton: {
     padding: SPACING.SMALL,
   },
  headerTitle: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.LARGE,
  },
  placeholderText: {
    fontSize: FONT_SIZES.LARGE,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MEDIUM,
  },
  todoText: {
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
});