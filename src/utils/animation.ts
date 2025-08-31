import { Platform } from 'react-native';

/**
 * Helper function to determine if native driver should be used for animations.
 * Returns false on web platform to avoid warnings and use JS-based animations.
 */
export const shouldUseNativeDriver = Platform.OS !== 'web';

/**
 * Animation configuration with platform-appropriate native driver setting
 */
export const createAnimationConfig = (config: any) => ({
  ...config,
  useNativeDriver: shouldUseNativeDriver,
});