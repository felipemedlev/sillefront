import { Dimensions, Platform } from 'react-native';

// Responsive breakpoints
export const BREAKPOINTS = {
  MOBILE: 0,
  TABLET: 768,
  DESKTOP: 1024,
  LARGE_DESKTOP: 1440,
} as const;

// Get screen dimensions
export const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

// Determine current breakpoint
export const getCurrentBreakpoint = () => {
  const { width } = getScreenDimensions();
  
  if (width >= BREAKPOINTS.LARGE_DESKTOP) return 'LARGE_DESKTOP';
  if (width >= BREAKPOINTS.DESKTOP) return 'DESKTOP';
  if (width >= BREAKPOINTS.TABLET) return 'TABLET';
  return 'MOBILE';
};

// Check if current platform is web
export const isWeb = () => Platform.OS === 'web';

// Check if desktop size
export const isDesktopSize = () => {
  const { width } = getScreenDimensions();
  return width >= BREAKPOINTS.TABLET && isWeb();
};

// Check if large desktop size
export const isLargeDesktopSize = () => {
  const { width } = getScreenDimensions();
  return width >= BREAKPOINTS.DESKTOP && isWeb();
};

// Responsive container widths
export const getContainerWidth = () => {
  const { width } = getScreenDimensions();
  const breakpoint = getCurrentBreakpoint();
  
  switch (breakpoint) {
    case 'LARGE_DESKTOP':
      return Math.min(width * 0.8, 1200);
    case 'DESKTOP':
      return Math.min(width * 0.85, 1000);
    case 'TABLET':
      return Math.min(width * 0.9, 800);
    default:
      return width * 0.95;
  }
};

// Responsive padding
export const getResponsivePadding = () => {
  const breakpoint = getCurrentBreakpoint();
  
  switch (breakpoint) {
    case 'LARGE_DESKTOP':
      return { horizontal: 40, vertical: 32 };
    case 'DESKTOP':
      return { horizontal: 32, vertical: 24 };
    case 'TABLET':
      return { horizontal: 24, vertical: 20 };
    default:
      return { horizontal: 16, vertical: 16 };
  }
};

// Responsive font scaling
export const getResponsiveFontSize = (baseFontSize: number) => {
  const breakpoint = getCurrentBreakpoint();
  
  switch (breakpoint) {
    case 'LARGE_DESKTOP':
      return baseFontSize * 1.2;
    case 'DESKTOP':
      return baseFontSize * 1.1;
    case 'TABLET':
      return baseFontSize * 1.05;
    default:
      return baseFontSize;
  }
};

// Responsive spacing
export const getResponsiveSpacing = (baseSpacing: number) => {
  const breakpoint = getCurrentBreakpoint();
  
  switch (breakpoint) {
    case 'LARGE_DESKTOP':
      return baseSpacing * 1.5;
    case 'DESKTOP':
      return baseSpacing * 1.25;
    case 'TABLET':
      return baseSpacing * 1.1;
    default:
      return baseSpacing;
  }
};

// Grid columns based on screen size
export const getGridColumns = () => {
  const breakpoint = getCurrentBreakpoint();
  
  switch (breakpoint) {
    case 'LARGE_DESKTOP':
      return 4;
    case 'DESKTOP':
      return 3;
    case 'TABLET':
      return 2;
    default:
      return 1;
  }
};

// Hook for responsive values
export const useResponsive = () => {
  const screenDimensions = getScreenDimensions();
  const breakpoint = getCurrentBreakpoint();
  
  return {
    ...screenDimensions,
    breakpoint,
    isDesktop: isDesktopSize(),
    isLargeDesktop: isLargeDesktopSize(),
    containerWidth: getContainerWidth(),
    padding: getResponsivePadding(),
    getFontSize: getResponsiveFontSize,
    getSpacing: getResponsiveSpacing,
    gridColumns: getGridColumns(),
  };
};