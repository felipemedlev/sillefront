import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons'; // <-- Add Feather import
import { COLORS } from '../../types/constants'; // <-- Add COLORS import

const OCCASIONS = [
  { id: 1, title: 'Romántica', color: '#F5E6E6' },
  { id: 2, title: 'Casual', color: '#E6F0F5' },
  { id: 3, title: 'Formal', color: '#E6E6E6' },
  { id: 4, title: 'Noche', color: '#E6E6F5' },
  { id: 5, title: 'Deportiva', color: '#E6F5E6' },
  { id: 6, title: 'Viaje', color: '#F5E6F5' },
  { id: 7, title: 'Oficina', color: '#E6F5F5' },
  { id: 8, title: 'Fiesta', color: '#F5F5E6' },
  { id: 9, title: 'Relax', color: '#E6F5E6' },
  { id: 10, title: 'Especial', color: '#F5E6E6' },
];

export default function AIBoxScreen() {
  const handleOpenPress = () => {
    router.push('/aibox-selection');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Main Card */}
        <View style={styles.mainCard}>
          <Text style={styles.subtitle}>Tu Box Personalizado</Text>
          <Text style={styles.mainTitle}>¡Está listo tu Box AI!</Text>
          <Pressable style={styles.openButton} onPress={handleOpenPress}>
            <Text style={styles.openButtonText}>Abrir</Text>
          </Pressable>
        </View>

        {/* Manual Box Card */}
        <View style={[styles.mainCard, styles.manualCard]}>
          <Feather name="edit-3" size={28} color={COLORS.PRIMARY} style={styles.cardIcon} />
          <Text style={styles.subtitle}>Crea tu Propia Selección</Text>
          <Text style={styles.mainTitle}>Box Manual</Text>
          <Pressable style={styles.openButton} onPress={() => router.push('../manual-box')}>
            <Text style={styles.openButtonText}>Configurar</Text>
          </Pressable>
        </View>

        {/* Occasions Section */}
        <Text style={styles.sectionTitle}>Ocasiones</Text>
        <View style={styles.occasionsGrid}>
          {OCCASIONS.map((occasion) => (
            <Pressable
              key={occasion.id}
              style={({ pressed }) => [
                styles.occasionCard,
                { backgroundColor: occasion.color },
                pressed && styles.occasionCardPressed,
              ]}
            >
              <Text style={styles.occasionTitle}>{occasion.title}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 0,
    alignItems: 'center',
  },
  mainCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 5,
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  openButton: {
    backgroundColor: '#000',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  openButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  occasionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  occasionCard: {
    width: '48%',
    aspectRatio: 2,
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  occasionCardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  occasionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  // Styles for Manual Box Card
  manualCard: {
    backgroundColor: '#F0F4F8', // A slightly different background for distinction
    marginTop: 16, // Add some space above it
  },
  cardIcon: {
    marginBottom: 12, // Space below the icon
  },
});