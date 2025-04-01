import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform, ScrollView, ActivityIndicator } from 'react-native'; // Added ActivityIndicator
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import { useSubscription } from '../../../context/SubscriptionContext';
import { useRatings } from '../../../context/RatingsContext'; // Import useRatings
import { MOCK_PURCHASES } from '../../../data/mockPurchases'; // Import mock purchases
import { COLORS, FONTS, SPACING, FONT_SIZES } from '../../../types/constants'; // Removed SUBSCRIPTION_TIERS (not used directly here)

type MenuItem = {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color?: string; // Optional color for specific items like logout
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isLoading: isAuthLoading } = useAuth(); // Get auth loading state too
  const { subscriptionStatus, isLoading: isSubscriptionLoading } = useSubscription();
  const { ratings, favorites, isLoadingRatings, isLoadingFavorites } = useRatings(); // Get ratings, favorites, and their loading states

  // Define base menu items
  const menuItems: MenuItem[] = [
    {
      id: 'personal',
      title: 'Información personal',
      icon: 'person-outline',
      onPress: () => router.push('/(tabs)/(profile)/personal-info'), // Navigate to personal info screen
    },
    {
      id: 'password',
      title: 'Cambiar contraseña',
      icon: 'lock-closed-outline',
      onPress: () => router.push('/(tabs)/(profile)/change-password'), // Navigate to change password screen
    },
    {
      id: 'purchases',
      title: 'Mis compras',
      icon: 'bag-outline',
      onPress: () => router.push('/(tabs)/(profile)/purchases'), // Navigate to purchases screen
    },
    {
      id: 'favorites',
      title: 'Mis Favoritos',
      icon: 'heart-outline',
      // Correct the path using href object for typed routes
      onPress: () => router.push({ pathname: '/(tabs)/(profile)/favorites' }),
    },
    {
      id: 'test',
      title: 'Editar Test Inicial',
      icon: 'create-outline',
      onPress: () => {
        // Consider saving answers if SurveyContext is used here
        router.push('/survey/1');
      },
    },
    {
      id: 'logout',
      title: 'Cerrar Sesión',
      icon: 'log-out-outline',
      color: COLORS.ERROR, // Use error color for logout
      onPress: async () => {
        try {
          await logout();
          // Navigation is handled by the profile layout (_layout.tsx)
        } catch (error) {
          console.error("Error during logout:", error);
          // Optionally show an error message to the user
        }
      },
    },
  ];

  // Display loading or placeholder if user data isn't available yet
  // Combined loading state check
  const isLoading = isAuthLoading || isSubscriptionLoading || isLoadingRatings || isLoadingFavorites;

  if (isLoading) {
     return (
        <View style={[styles.container, styles.loadingContainer]}>
            <ActivityIndicator size="large" color={COLORS.ACCENT} />
            <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
     );
  }

  // Ensure user is loaded before rendering the rest (should be guaranteed by isLoading check)
  if (!user) {
     // Fallback in case something unexpected happens
     return (
        <View style={[styles.container, styles.loadingContainer]}>
            <Text style={styles.loadingText}>Error al cargar datos del usuario.</Text>
        </View>
     );
  }


  // --- Dynamically create subscription menu item ---
  const subscriptionMenuItem: MenuItem = subscriptionStatus?.isActive
    ? {
        id: 'subscription',
        title: 'Administrar Suscripción',
        icon: 'card-outline',
        onPress: () => router.push({ pathname: '/subscription' as any }), // Cast to any as workaround
      }
    : {
        id: 'subscription',
        title: 'Ver Planes de Suscripción',
        icon: 'card-outline',
        onPress: () => router.push({ pathname: '/subscription' as any }), // Cast to any as workaround
      };

  // Insert the subscription item into the menu array (e.g., before 'Editar Test')
  const finalMenuItems = [...menuItems];
  const editTestIndex = finalMenuItems.findIndex(item => item.id === 'test');
  if (editTestIndex !== -1) {
    finalMenuItems.splice(editTestIndex, 0, subscriptionMenuItem);
  } else {
    // Fallback: add before logout if 'test' isn't found
    const logoutIndex = finalMenuItems.findIndex(item => item.id === 'logout');
    if (logoutIndex !== -1) {
      finalMenuItems.splice(logoutIndex, 0, subscriptionMenuItem);
    } else {
      finalMenuItems.push(subscriptionMenuItem); // Add at the end as last resort
    }
  }
  // --- End dynamic menu item creation ---

  return (
    <ScrollView>
      <View style={styles.container}>
        {/* Profile Header */}
        <View style={styles.header}>
          <Image
            source={require('../../../assets/images/avatar.png')} // Keep placeholder avatar for now
            style={styles.avatar}
          />
          {/* Display User Email */}
          <Text style={styles.userEmail}>{user.email}</Text>

          {/* Dynamic Stats */}
          <View style={styles.statsContainer}>
            {/* Calificaciones */}
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{ratings.length}</Text>
              <Text style={styles.statLabel}>Calificaciones</Text>
            </View>
            <View style={styles.statDivider} />
            {/* Compras */}
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{MOCK_PURCHASES.length}</Text>
              <Text style={styles.statLabel}>Compras</Text>
            </View>
            <View style={styles.statDivider} />
             {/* Favoritos */}
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{favorites.length}</Text>
              <Text style={styles.statLabel}>Favoritos</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {finalMenuItems.map((item, index) => ( // Use finalMenuItems array
            <TouchableOpacity
              key={item.id}
              // Remove bottom border for the last item
              style={[styles.menuItem, index === finalMenuItems.length - 1 && styles.menuItemLast]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name={item.icon} size={24} color={item.color || COLORS.TEXT_PRIMARY} />
              </View>
              <Text style={[styles.menuText, item.color ? { color: item.color } : {}]}>
                {item.title}
              </Text>
              {/* Hide chevron for logout item */}
              {item.id !== 'logout' && (
                <Ionicons name="chevron-forward" size={24} color={"#CCCCCC"} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.BACKGROUND_ALT, // Use constant
    paddingTop: Platform.OS === 'android' ? SPACING.LARGE : SPACING.XLARGE, // Adjust top padding
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: SPACING.LARGE,
    paddingBottom: SPACING.LARGE, // Adjusted padding
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: SPACING.MEDIUM, // Adjusted margin
  },
  userEmail: { // Style for user email
    fontSize: FONT_SIZES.LARGE,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    fontFamily: FONTS.INSTRUMENT_SANS,
    marginBottom: SPACING.LARGE, // Add margin below email
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.MEDIUM, // Use constant for gap
    backgroundColor: COLORS.BACKGROUND, // Use constant
    paddingVertical: SPACING.MEDIUM, // Adjusted padding
    paddingHorizontal: SPACING.LARGE,
    borderRadius: 10,
    // Use platform-specific shadow/elevation if desired
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2.0,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 80, // Give items some minimum width
  },
  statNumber: {
    fontSize: FONT_SIZES.XLARGE, // Use constant
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY, // Use constant
    fontFamily: FONTS.INSTRUMENT_SANS,
    marginBottom: SPACING.XSMALL, // Use constant
  },
  statLabel: {
    fontSize: FONT_SIZES.SMALL, // Use constant
    color: COLORS.TEXT_SECONDARY, // Use constant
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.BORDER, // Use constant
  },
  loadingContainer: { // Added style
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    paddingHorizontal: SPACING.MEDIUM, // Adjusted padding
    backgroundColor: COLORS.BACKGROUND, // White background for menu items
    borderRadius: 10,
    marginHorizontal: SPACING.MEDIUM, // Add horizontal margin
    // Add shadow/elevation if desired
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 1,
    overflow: 'hidden', // Ensure border radius clips children
    marginBottom: 80,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.MEDIUM + 2, // Slightly more padding
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER, // Use constant
    paddingHorizontal: SPACING.SMALL, // Add horizontal padding inside item
  },
  menuItemLast: { // Style to remove border for the last item
    borderBottomWidth: 0,
  },
  menuIconContainer: {
    marginRight: SPACING.MEDIUM, // Use constant
    width: 30, // Ensure icons align
    alignItems: 'center',
  },
  menuText: {
    flex: 1,
    fontSize: FONT_SIZES.REGULAR, // Use constant
    color: COLORS.TEXT_PRIMARY, // Use constant
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  loadingText: { // Added style for loading text
      fontSize: FONT_SIZES.REGULAR,
      color: COLORS.TEXT_SECONDARY,
      fontFamily: FONTS.INSTRUMENT_SANS,
      marginTop: SPACING.LARGE,
  }
});