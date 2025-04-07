import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated, Dimensions, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Perfume } from '../../types/perfume'; // Assuming Perfume type is needed for price range calculation

// Define the structure for active filters, mirroring SearchScreen
interface ActiveFilters {
  brands: string[];
  occasions: string[];
  priceRange: { min: number; max: number } | null;
  genders: string[];
  dayNights: string[];
  seasons: string[];
}

interface FilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  initialFilters: ActiveFilters;
  onApplyFilters: (filters: ActiveFilters) => void;
  allBrands: string[];
  allOccasions: string[];
  minPrice: number;
  maxPrice: number;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isVisible,
  onClose,
  initialFilters,
  onApplyFilters,
  allBrands,
  allOccasions,
  minPrice,
  maxPrice,
}) => {
  const [tempFilters, setTempFilters] = useState<ActiveFilters>(initialFilters);

  const screenWidth = Dimensions.get('window').width;
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: screenWidth,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  // Reset temp filters when modal opens or initial filters change
  useEffect(() => {
    setTempFilters(initialFilters);
  }, [isVisible, initialFilters]);

  const handleApply = () => {
    onApplyFilters(tempFilters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters: ActiveFilters = {
      brands: [],
      occasions: [],
      priceRange: null, // Reset price range
      genders: [],
      dayNights: [],
      seasons: [],
    };
    setTempFilters(clearedFilters);
    // Apply cleared filters immediately or wait for explicit apply?
    // For now, let's require explicit apply after clearing
  };

  // --- Placeholder Render Functions for Filter Sections ---
  // TODO: Implement actual UI components (Checkboxes, Slider)

  const renderCheckboxGroup = (title: string, options: string[], selected: string[], onChange: (newSelection: string[]) => void) => {
    // Placeholder - Replace with actual Checkbox implementation
    return (
      <View style={styles.filterSection}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {options.map(option => (
          <TouchableOpacity key={option} onPress={() => {
            const newSelection = selected.includes(option)
              ? selected.filter(item => item !== option)
              : [...selected, option];
            onChange(newSelection);
          }}>
            <View style={styles.checkboxRow}>
              <Feather name={selected.includes(option) ? 'check-square' : 'square'} size={20} color="#333" />
              <Text style={styles.checkboxLabel}>{option}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderPriceInputs = () => {
    const currentMin = tempFilters.priceRange?.min?.toString() ?? '';
    const currentMax = tempFilters.priceRange?.max?.toString() ?? '';

    const handleMinChange = (text: string) => {
      const num = parseInt(text, 10);
      setTempFilters(f => {
        const newMin = isNaN(num) ? null : num;
        const maxVal = f.priceRange?.max ?? null;
        if (newMin === null && maxVal === null) return { ...f, priceRange: null };
        return { ...f, priceRange: { min: newMin ?? 0, max: maxVal ?? 0 } };
      });
    };

    const handleMaxChange = (text: string) => {
      const num = parseInt(text, 10);
      setTempFilters(f => {
        const minVal = f.priceRange?.min ?? null;
        const newMax = isNaN(num) ? null : num;
        if (minVal === null && newMax === null) return { ...f, priceRange: null };
        return { ...f, priceRange: { min: minVal ?? 0, max: newMax ?? 0 } };
      });
    };

    return (
      <View style={styles.filterSection}>
        <Text style={styles.sectionTitle}>Rango de Precio</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text>Mínimo</Text>
            <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 5, paddingHorizontal: 8, paddingVertical: 4 }}>
              <TextInput
                keyboardType="numeric"
                placeholder={`${minPrice}`}
                value={currentMin}
                onChangeText={handleMinChange}
              />
            </View>
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text>Máximo</Text>
            <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 5, paddingHorizontal: 8, paddingVertical: 4 }}>
              <TextInput
                keyboardType="numeric"
                placeholder={`${maxPrice}`}
                value={currentMax}
                onChangeText={handleMaxChange}
              />
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="none" // Use "none" and rely on Animated.View
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {/* TODO: Implement slide-in from right animation/positioning */}
        <Animated.View style={[styles.modalContainer, { transform: [{ translateX: slideAnim }] }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filtros</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Filters Scroll Area */}
          <ScrollView style={styles.scrollContainer}>
            {renderCheckboxGroup('Marca', allBrands, tempFilters.brands, (newSelection) => setTempFilters(f => ({ ...f, brands: newSelection })))}
            {renderCheckboxGroup('Ocasión', allOccasions, tempFilters.occasions, (newSelection) => setTempFilters(f => ({ ...f, occasions: newSelection })))}
            {renderPriceInputs()}
            {renderCheckboxGroup('Género', ['masculino', 'femenino', 'unisex'], tempFilters.genders, (newSelection) => setTempFilters(f => ({ ...f, genders: newSelection })))}
            {renderCheckboxGroup('Uso (Día/Noche)', ['Día', 'Noche', 'Ambos'], tempFilters.dayNights, (newSelection) => setTempFilters(f => ({ ...f, dayNights: newSelection })))}
            {renderCheckboxGroup('Temporada', ['Invierno', 'Otoño', 'Primavera', 'Verano'], tempFilters.seasons, (newSelection) => setTempFilters(f => ({ ...f, seasons: newSelection })))}
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity style={[styles.footerButton, styles.clearButton]} onPress={handleClear}>
              <Text style={[styles.footerButtonText, styles.clearButtonText]}>Limpiar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.footerButton, styles.applyButton]} onPress={handleApply}>
              <Text style={[styles.footerButtonText, styles.applyButtonText]}>Aplicar Filtros</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end', // Default slide from bottom, adjust for right
    // TODO: Add styles for right-side positioning if not using a library
  },
  modalContainer: {
    height: '100%', // Full height for side modal
    width: '85%', // Adjust width as needed
    backgroundColor: 'white',
    position: 'absolute', // For right positioning
    right: 0, // Position on the right
    top: 0,
    bottom: 0,
    borderTopLeftRadius: 10, // Optional styling
    borderBottomLeftRadius: 10, // Optional styling
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 5,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  filterSection: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 15,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#f0f0f0',
  },
  clearButtonText: {
    color: '#555',
  },
  applyButton: {
    backgroundColor: '#809CAC', // Theme color
  },
  applyButtonText: {
    color: 'white',
  },
});

export default FilterModal;