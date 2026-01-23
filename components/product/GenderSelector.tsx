import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SPACING, FONT_SIZES, COLORS, FONTS } from '../../types/constants';

type Genero = 'masculino' | 'femenino';

interface GenderSelectorProps {
  selectedGender: Genero;
  onSelectGender: (gender: Genero) => void;
}

const GenderSelector: React.FC<GenderSelectorProps> = ({ selectedGender, onSelectGender }) => (
  <View style={styles.generoContainer}>
    <TouchableOpacity
      style={[
        styles.generoOpcion,
        selectedGender === 'masculino' && styles.generoOpcionSelected
      ]}
      onPress={() => onSelectGender('masculino')}
      activeOpacity={0.8}
    >
      <View style={[
        styles.generoIconWrapper,
        { backgroundColor: selectedGender === 'masculino' ? COLORS.ACCENT : COLORS.BACKGROUND_ALT }
      ]}>
        <Feather
          name="user"
          size={20}
          color={selectedGender === 'masculino' ? '#fff' : COLORS.TEXT_SECONDARY}
        />
      </View>
      <Text style={[
        styles.generoLabel,
        { color: selectedGender === 'masculino' ? COLORS.TEXT_PRIMARY : COLORS.TEXT_SECONDARY }
      ]}>
        Hombre
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[
        styles.generoOpcion,
        selectedGender === 'femenino' && [
          styles.generoOpcionSelected,
          { borderColor: '#D4A5A5' }
        ]
      ]}
      onPress={() => onSelectGender('femenino')}
      activeOpacity={0.8}
    >
      <View style={[
        styles.generoIconWrapper,
        { backgroundColor: selectedGender === 'femenino' ? '#D4A5A5' : COLORS.BACKGROUND_ALT }
      ]}>
        <Feather
          name="user"
          size={20}
          color={selectedGender === 'femenino' ? '#fff' : COLORS.TEXT_SECONDARY}
        />
      </View>
      <Text style={[
        styles.generoLabel,
        { color: selectedGender === 'femenino' ? COLORS.TEXT_PRIMARY : COLORS.TEXT_SECONDARY }
      ]}>
        Mujer
      </Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  generoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: SPACING.MEDIUM,
  },
  generoOpcion: {
    flex: 1,
    maxWidth: 150,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: SPACING.MEDIUM,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  generoOpcionSelected: {
    borderColor: COLORS.ACCENT,
    borderWidth: 2,
    shadowOpacity: 0.1,
    elevation: 2,
  },
  generoIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  generoLabel: {
    fontSize: FONT_SIZES.SMALL,
    fontWeight: '600',
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
});

export { type Genero };
export default GenderSelector;