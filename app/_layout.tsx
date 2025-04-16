import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Slot, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import * as Font from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { RatingsProvider } from '../context/RatingsContext';
import { ManualBoxProvider } from '../context/ManualBoxContext';
import { CartProvider } from '../context/CartContext';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { SubscriptionProvider } from '../context/SubscriptionContext';
import { SurveyProvider } from '../context/SurveyContext';
import { FontLoadingState, LayoutStyles } from '../types/layout';
import { FONTS, COLORS, FONT_SIZES, SPACING } from '../types/constants';
import { handleError } from '../types/error';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#222222',
    },
    secondary: {
      main: COLORS.ACCENT,
    },
    background: {
      default: '#FFFEFC',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: 'InstrumentSans',
    button: {
      fontFamily: 'InstrumentSans',
      textTransform: 'none',
    },
    h1: {
      fontFamily: 'InstrumentSans',
    },
    h2: {
      fontFamily: 'InstrumentSans',
    },
    h3: {
      fontFamily: 'InstrumentSans',
    },
    h4: {
      fontFamily: 'InstrumentSans',
    },
    h5: {
      fontFamily: 'InstrumentSans',
    },
    h6: {
      fontFamily: 'InstrumentSans',
    },
    body1: {
      fontFamily: 'InstrumentSans',
    },
    body2: {
      fontFamily: 'InstrumentSans',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '@font-face': {
          fontFamily: 'InstrumentSans',
          src: `url(${require('../assets/fonts/InstrumentSans-Regular.ttf')}) format('truetype')`,
          fontWeight: 'normal',
          fontStyle: 'normal',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          fontSize: '18px',
          textTransform: 'none',
          padding: '10px 20px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
  },
});

// Create a new component that handles the protected routes logic
function ProtectedRoutes() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    // Don't do anything until navigation is ready and auth state is loaded
    if (isAuthLoading || !navigationState?.key) {
      return;
    }

    // Get first segment of the route
    const firstSegment = segments[0];

    // Only protect checkout route
    const isCheckoutRoute = firstSegment === 'checkout';

    // If not logged in and trying to access checkout, redirect to login
    if (!user && isCheckoutRoute) {
      router.replace('/login');
    }

    // If user is logged in and trying to access auth screens, redirect to home
    const isAuthRoute = ['login', 'signup'].includes(firstSegment as string);
    if (user && isAuthRoute) {
      router.replace('/(tabs)');
    }
  }, [user, isAuthLoading, segments, router, navigationState]);

  // Return a slot that will be filled with the matched route
  return <Slot />;
}

// Component to load fonts
function FontLoader({ children }: { children: React.ReactNode }) {
  const [fontState, setFontState] = useState<FontLoadingState>({
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          [FONTS.INSTRUMENT_SANS]: require('../assets/fonts/InstrumentSans-Regular.ttf'),
          [FONTS.INSTRUMENT_SERIF]: require('../assets/fonts/InstrumentSerif-Regular.ttf'),
          [FONTS.INSTRUMENT_SERIF_ITALIC]: require('../assets/fonts/InstrumentSerif-Italic.ttf'),
        });
        setFontState({ isLoading: false, error: null });
      } catch (error) {
        const appError = handleError(error);
        setFontState({
          isLoading: false,
          error: appError.message,
        });
      }
    };
    loadFonts();
  }, []);

  if (fontState.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (fontState.error) {
    console.error('Error loading fonts:', fontState.error);
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <FontLoader>
          <AuthProvider>
            <SurveyProvider>
              <SubscriptionProvider>
                <CartProvider>
                  <ManualBoxProvider>
                    <RatingsProvider>
                      <ProtectedRoutes />
                    </RatingsProvider>
                  </ManualBoxProvider>
                </CartProvider>
              </SubscriptionProvider>
            </SurveyProvider>
          </AuthProvider>
        </FontLoader>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles: LayoutStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stackContent: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingText: {
    marginTop: SPACING.MEDIUM,
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.PRIMARY,
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    padding: SPACING.LARGE,
  },
  errorText: {
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.ERROR,
    textAlign: 'center',
    marginBottom: SPACING.SMALL,
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  fallbackText: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
});