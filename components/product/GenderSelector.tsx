import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SPACING, FONT_SIZES, COLORS } from '../../types/constants';
import { LinearGradient } from 'expo-linear-gradient';

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
        selectedGender === 'masculino' && styles.generoOpcionSelected,
        { borderColor: COLORS.GIFTBOX.MALE.PRIMARY }
      ]}
      onPress={() => onSelectGender('masculino')}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={[COLORS.GIFTBOX.MALE.BG, COLORS.GIFTBOX.BACKGROUND_ALT]}
        style={styles.generoGradient}
      >
        <View style={[styles.generoIconWrapper, { backgroundColor: COLORS.GIFTBOX.MALE.LIGHT }]}>
          <Feather name="user" size={24} color="#fff" />
        </View>
        <Text style={[styles.generoLabel, { color: COLORS.GIFTBOX.MALE.PRIMARY }]}>Hombre</Text>
      </LinearGradient>
    </TouchableOpacity>

    <TouchableOpacity
      style={[
        styles.generoOpcion,
        selectedGender === 'femenino' && styles.generoOpcionSelected,
        { borderColor: COLORS.GIFTBOX.FEMALE.PRIMARY }
      ]}
      onPress={() => onSelectGender('femenino')}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={[COLORS.GIFTBOX.FEMALE.BG, COLORS.GIFTBOX.BACKGROUND_ALT]}
        style={styles.generoGradient}
      >
        <View style={[styles.generoIconWrapper, { backgroundColor: COLORS.GIFTBOX.FEMALE.LIGHT }]}>
          <Feather name="user" size={24} color="#fff" />
        </View>
        <Text style={[styles.generoLabel, { color: COLORS.GIFTBOX.FEMALE.PRIMARY }]}>Mujer</Text>
      </LinearGradient>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  generoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.MEDIUM,
    width: '100%',
    gap: SPACING.MEDIUM,
  },
  generoOpcion: {
    flex: 1,
    maxWidth: 180,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.GIFTBOX.BORDER,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: COLORS.GIFTBOX.CARD_SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  generoOpcionSelected: {
    borderWidth: 2,
    elevation: 2,
    shadowOpacity: 0.2,
  },
  generoGradient: {
    padding: SPACING.MEDIUM,
    alignItems: 'center',
    paddingVertical: SPACING.MEDIUM,
  },
  generoIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  generoLabel: {
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '600',
  },
});

export { type Genero };
export default GenderSelector;