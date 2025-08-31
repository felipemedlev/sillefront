/**
 * Console utilities for development
 * Helps reduce noise from known framework warnings that don't affect functionality
 */

const originalWarn = console.warn;

// List of warning patterns to suppress in development
const SUPPRESSED_WARNINGS = [
  'shadow*" style props are deprecated. Use "boxShadow"',
  'useNativeDriver" is not supported because the native animated module is missing',
  'Slow network is detected',
  'Fallback font will be used while loading',
];

/**
 * Filter console warnings to reduce development noise
 */
export const initializeConsoleFilter = () => {
  if (__DEV__) {
    console.warn = (...args) => {
      const message = args.join(' ');
      
      // Check if this warning should be suppressed
      const shouldSuppress = SUPPRESSED_WARNINGS.some(pattern => 
        message.includes(pattern)
      );
      
      if (!shouldSuppress) {
        originalWarn.apply(console, args);
      }
    };
  }
};