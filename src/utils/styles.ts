import { Platform, ViewStyle } from 'react-native';

/**
 * Utility to create platform-optimized shadow styles.
 * On web, uses boxShadow instead of individual shadow properties to avoid deprecation warnings.
 */
export const createShadow = (
  color: string = '#000',
  offset: { width: number; height: number } = { width: 0, height: 2 },
  opacity: number = 0.1,
  radius: number = 4
): ViewStyle => {
  if (Platform.OS === 'web') {
    // Use boxShadow for web to avoid deprecation warnings
    return {
      boxShadow: `${offset.width}px ${offset.height}px ${radius}px rgba(0, 0, 0, ${opacity})`,
    } as ViewStyle;
  }

  // Use individual shadow properties for native platforms
  return {
    shadowColor: color,
    shadowOffset: offset,
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation: radius, // Android elevation
  };
};

/**
 * Common shadow presets for consistent design
 */
export const shadows = {
  small: createShadow('#000', { width: 0, height: 1 }, 0.05, 2),
  medium: createShadow('#000', { width: 0, height: 2 }, 0.1, 4),
  large: createShadow('#000', { width: 0, height: 4 }, 0.15, 8),
  card: createShadow('#000', { width: 0, height: 2 }, 0.08, 6),
};