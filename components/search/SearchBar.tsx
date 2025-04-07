import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONT_SIZES } from '../../types/constants';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onManualBoxPress?: () => void;
  onFilterPress?: () => void; // Add filter press handler prop
}

export default function SearchBar({ value, onChangeText, placeholder = 'Buscar perfumes...', onManualBoxPress, onFilterPress }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.searchRow}> {/* Wrap search input and filter icon */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#666"
          />
          {value.length > 0 && (
            <TouchableOpacity onPress={() => onChangeText('')} style={styles.clearButton}>
              <Feather name="x" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={onFilterPress} style={styles.filterButton}>
          <Feather name="filter" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.manualBoxButton}
        onPress={onManualBoxPress}
      >
        <Feather name="box" size={18} color={COLORS.BACKGROUND} style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Mi Box Personalizado</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFEFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchRow: { // New style for the row containing search and filter
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchContainer: {
    flex: 1, // Allow search container to take available space
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    // Removed marginBottom as it's now on searchRow
  },
  filterButton: { // Style for the filter icon button
    marginLeft: 12,
    padding: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  manualBoxButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.TEXT_SECONDARY,
    borderRadius: 12,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: COLORS.BACKGROUND,
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '600',
  },
});