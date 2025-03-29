import React, { useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import PriceRangeButtons from '../../components/product/PriceRangeButtons';
import { COLORS, SPACING, FONT_SIZES } from '../../types/constants';

const DESKTOP_BREAKPOINT = 768;

type Genero = 'masculino' | 'femenino';

interface TarjetaCajaRegalo {
  id: string;
  titulo: string;
  descripcion: string;
  icono: keyof typeof Feather.glyphMap;
}

const cajasRegalo: TarjetaCajaRegalo[] = [
  {
    id: '1',
    titulo: 'Uso Casual',
    descripcion: 'Perfecto para ocasiones cotidianas',
    icono: 'sun',
  },
  {
    id: '2',
    titulo: 'Uso Formal',
    descripcion: 'Fragancias elegantes para momentos especiales',
    icono: 'briefcase',
  },
  {
    id: '3',
    titulo: 'Uso Nocturno',
    descripcion: 'Fragancias sofisticadas para eventos nocturnos',
    icono: 'moon',
  },
  {
    id: '4',
    titulo: 'Ocasión Especial',
    descripcion: 'Fragancias de lujo para momentos memorables',
    icono: 'star',
  },
];

export default function PantallaCajaRegalo() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const [generoSeleccionado, setGeneroSeleccionado] = useState<Genero>('masculino');
  const [rangoPrecio, setRangoPrecio] = useState('50.000-70.000');
  const [decantCount, setDecantCount] = useState<4 | 8>(4);
  const [decantSize, setDecantSize] = useState<3 | 5 | 10>(5);

  const colorMasculino = '#E6F3FF'; // Light blue background
  const colorFemenino = '#FFE6F3'; // Light pink background
  const colorMasculinoActivo = colorMasculino; // Use light blue for active state
  const colorFemeninoActivo = colorFemenino; // Use light pink for active state

  const formatearPrecio = (valor: number) => {
    return valor.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Selección de Género */}
        <View style={styles.generoContainer}>
          <TouchableOpacity
            style={[
              styles.generoOpcion,
              { backgroundColor: generoSeleccionado === 'masculino' ? colorMasculinoActivo : colorMasculino },
            ]}
            onPress={() => setGeneroSeleccionado('masculino')}
          >
            <Feather name="user" size={32} color="#333" />
            <Text style={styles.generoLabel}>Hombre</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.generoOpcion,
              { backgroundColor: generoSeleccionado === 'femenino' ? colorFemeninoActivo : colorFemenino },
            ]}
            onPress={() => setGeneroSeleccionado('femenino')}
          >
            <Feather name="user" size={32} color="#333" />
            <Text style={styles.generoLabel}>Mujer</Text>
          </TouchableOpacity>
        </View>

        {/* Decant Selection */}
        <View style={[styles.decantCountContainer]}>
          <Pressable
            style={[
              styles.decantCountButton,
              decantCount === 4 && styles.decantCountButtonActive,
              { padding: 12, margin: 4 }
            ]}
            onPress={() => setDecantCount(4)}
          >
            <Text style={[
              styles.decantCountText,
              decantCount === 4 && styles.decantCountTextActive,
            ]}>4 Decants</Text>
          </Pressable>
          <Pressable
            style={[
              styles.decantCountButton,
              decantCount === 8 && styles.decantCountButtonActive,
              { padding: 12, margin: 4 }
            ]}
            onPress={() => setDecantCount(8)}
          >
            <Text style={[
              styles.decantCountText,
              decantCount === 8 && styles.decantCountTextActive,
            ]}>8 Decants</Text>
          </Pressable>
        </View>

        {/* Price Range Selection */}
        <View style={styles.priceRangeContainer}>
          <PriceRangeButtons
            currentRange={rangoPrecio}
            setCurrentRange={setRangoPrecio}
          />
        </View>

        {/* Tarjetas de Caja Regalo */}
        <View style={styles.cardsContainer}>
          {cajasRegalo.map((caja) => (
            <TouchableOpacity
              key={caja.id}
              style={[
                styles.card,
                {
                  backgroundColor: generoSeleccionado === 'masculino' ? colorMasculino : colorFemenino,
                },
              ]}
            >
              <View style={styles.cardIconContainer}>
                <Feather name={caja.icono} size={32} color="#333" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{caja.titulo}</Text>
                <Text style={styles.cardDescription}>{caja.descripcion}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    padding: SPACING.LARGE,
    maxWidth: 1200,
    marginHorizontal: 'auto',
    alignItems: 'flex-start',
    width: '100%',
  },
  generoContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: SPACING.XLARGE,
    gap: SPACING.MEDIUM,
    width: '100%',
    paddingHorizontal: SPACING.MEDIUM,
  },
  generoOpcion: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.LARGE,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: COLORS.BACKGROUND,
    maxWidth: 200,
  },
  generoLabel: {
    marginTop: SPACING.SMALL,
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  decantCountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.SMALL,
    gap: SPACING.MEDIUM,
    width: '100%',
    maxWidth: 600,
  },
  decantCountButton: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
  },
  decantCountButtonActive: {
    backgroundColor: COLORS.ACCENT,
    borderColor: COLORS.ACCENT,
  },
  decantCountText: {
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.TEXT_PRIMARY,
  },
  decantCountTextActive: {
    color: COLORS.BACKGROUND,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.MEDIUM,
    marginTop: SPACING.XLARGE,
    width: '100%',
    paddingHorizontal: SPACING.MEDIUM,
  },
  card: {
    width: '48%',
    padding: SPACING.LARGE,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: COLORS.BACKGROUND,
  },
  cardIconContainer: {
    marginBottom: SPACING.MEDIUM,
  },
  cardContent: {
    gap: SPACING.SMALL,
  },
  cardTitle: {
    fontSize: FONT_SIZES.LARGE,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  cardDescription: {
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
  },
  priceRangeContainer: {
    width: '100%'
  },
});