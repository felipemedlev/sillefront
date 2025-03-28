import React, { useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

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
  const [rangoPrecio, setRangoPrecio] = useState([50000, 100000]);

  const colorMasculino = '#E8ECF0';
  const colorFemenino = '#F0E8EC';
  const colorMasculinoActivo = '#C8D4E0';
  const colorFemeninoActivo = '#E0C8D4';

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

        {/* Rango de Precio */}
        <View style={styles.sliderContainer}>
          <Text style={styles.sectionTitle}>Rango de Precio</Text>
          <View style={styles.sliderWrapper}>
            <MultiSlider
              values={rangoPrecio}
              min={0}
              max={120000}
              step={1000}
              onValuesChange={setRangoPrecio}
              sliderLength={width - 80}
              selectedStyle={{
                backgroundColor: '#333',
                height: 4,
              }}
              unselectedStyle={{
                backgroundColor: '#ddd',
                height: 4,
              }}
              containerStyle={styles.slider}
            />
          </View>
          <View style={styles.precioLabels}>
            <Text style={styles.precioLabel}>{formatearPrecio(rangoPrecio[0])}</Text>
            <Text style={styles.precioLabel}>{formatearPrecio(rangoPrecio[1])}</Text>
          </View>
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
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 20,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  generoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 16,
  },
  generoOpcion: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  generoLabel: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sliderContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  sliderWrapper: {
    marginBottom: 8,
    alignItems: 'center',
  },
  slider: {
    height: 40,
  },
  precioLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  precioLabel: {
    fontSize: 14,
    color: '#666',
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  cardIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});