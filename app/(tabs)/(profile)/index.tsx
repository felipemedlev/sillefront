import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Image, TouchableOpacity, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../src/context/AuthContext';
import { useSubscription } from '../../../context/SubscriptionContext';
import { useRatings } from '../../../context/RatingsContext';
import { MOCK_PURCHASES } from '../../../data/mockPurchases';
import { COLORS, FONTS, SPACING, FONT_SIZES } from '../../../types/constants';
import { Paper, Avatar, Divider } from '@mui/material';

type MenuItem = {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color?: string;
};

export default function ProfileScreen() {
  const router = useRouter();
  const DESKTOP_BREAKPOINT = 768;
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const { subscriptionStatus, isLoading: isSubscriptionLoading } = useSubscription();
  const { ratings, favorites, isLoadingRatings, isLoadingFavorites } = useRatings();

  // Define base menu items
  const menuItems: MenuItem[] = [
    {
      id: 'personal',
      title: 'Información personal',
      icon: 'person-outline',
      onPress: () => router.push('/(tabs)/(profile)/personal-info'),
    },
    {
      id: 'password',
      title: 'Cambiar contraseña',
      icon: 'lock-closed-outline',
      onPress: () => router.push('/(tabs)/(profile)/change-password'),
    },
    {
      id: 'purchases',
      title: 'Mis compras',
      icon: 'bag-outline',
      onPress: () => router.push('/(tabs)/(profile)/purchases'),
    },
    {
      id: 'favorites',
      title: 'Mis Favoritos',
      icon: 'heart-outline',
      onPress: () => router.push({ pathname: '/(tabs)/(profile)/favorites' }),
    },
    {
      id: 'test',
      title: 'Editar Test Inicial',
      icon: 'create-outline',
      onPress: () => {
        router.push('/survey/1');
      },
    },
    {
      id: 'logout',
      title: 'Cerrar Sesión',
      icon: 'log-out-outline',
      color: COLORS.ERROR,
      onPress: async () => {
        try {
          await logout();
        } catch (error) {
          console.error("Error during logout:", error);
        }
      },
    },
  ];

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

  if (!user) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Error al cargar datos del usuario.</Text>
      </View>
    );
  }

  // Dynamically create subscription menu item
  const subscriptionMenuItem: MenuItem = subscriptionStatus?.isActive
    ? {
      id: 'subscription',
      title: 'Administrar Suscripción',
      icon: 'card-outline',
      onPress: () => router.push({ pathname: '/subscription' as any }),
    }
    : {
      id: 'subscription',
      title: 'Ver Planes de Suscripción',
      icon: 'card-outline',
      onPress: () => router.push({ pathname: '/subscription' as any }),
    };

  // Insert the subscription item into the menu array
  const finalMenuItems = [...menuItems];
  const editTestIndex = finalMenuItems.findIndex(item => item.id === 'test');
  if (editTestIndex !== -1) {
    finalMenuItems.splice(editTestIndex, 0, subscriptionMenuItem);
  } else {
    const logoutIndex = finalMenuItems.findIndex(item => item.id === 'logout');
    if (logoutIndex !== -1) {
      finalMenuItems.splice(logoutIndex, 0, subscriptionMenuItem);
    } else {
      finalMenuItems.push(subscriptionMenuItem);
    }
  }

  const containerStyle = {
    ...styles.container,
    paddingTop: Platform.OS === 'android' ? SPACING.MEDIUM : isDesktop ? 100 : SPACING.LARGE,
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={containerStyle}>
        {/* Enhanced Profile Header with MUI Avatar */}
        <Paper
          sx={{
            backgroundColor: COLORS.BACKGROUND,
            borderRadius: 3,
            padding: 1,
            margin: 2,
            marginBottom: 1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <View style={styles.header}>
            <Avatar
              sx={{
                width: 70,
                height: 70,
                backgroundColor: COLORS.ACCENT,
                fontSize: 28,
                fontWeight: '600',
                marginBottom: 1,
              }}
              alt={user.email.charAt(0).toUpperCase()}
              src=""
            >
              {user.email.charAt(0).toUpperCase()}
            </Avatar>
            <Text style={styles.userName}>{user.name || user.email}</Text>
            {/* <Text style={styles.userEmail}>{user.email}</Text> */}
          </View>
        </Paper>

        {/* Stats Card */}
        <Paper
          sx={{
            backgroundColor: COLORS.BACKGROUND,
            borderRadius: 3,
            padding: 0,
            margin: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            overflow: 'hidden',
          }}
        >
          <View style={styles.statsWrapper}>
            <View style={styles.statsContainer}>
              {/* Calificaciones */}
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => router.push('/(tabs)/(ratings)')}
                activeOpacity={0.7}
              >
                <Ionicons name="star" size={20} color={COLORS.ACCENT} style={styles.statIcon} />
                <Text style={styles.statNumber}>{ratings.length}</Text>
                <Text style={styles.statLabel}>Calificaciones</Text>
              </TouchableOpacity>
              <Divider orientation="vertical" flexItem sx={{ height: 40, margin: '0 12px' }} />
              {/* Compras */}
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => router.push('/(tabs)/(profile)/purchases')}
                activeOpacity={0.7}
              >
                <Ionicons name="bag" size={20} color={COLORS.ACCENT} style={styles.statIcon} />
                <Text style={styles.statNumber}>{MOCK_PURCHASES.length}</Text>
                <Text style={styles.statLabel}>Compras</Text>
              </TouchableOpacity>
              <Divider orientation="vertical" flexItem sx={{ height: 40, margin: '0 12px' }} />
              {/* Favoritos */}
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => router.push('/(tabs)/(profile)/favorites')}
                activeOpacity={0.7}
              >
                <Ionicons name="heart" size={20} color={COLORS.ACCENT} style={styles.statIcon} />
                <Text style={styles.statNumber}>{favorites.length}</Text>
                <Text style={styles.statLabel}>Favoritos</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Paper>

        {/* Menu Items */}
        <Paper
          sx={{
            backgroundColor: COLORS.BACKGROUND,
            borderRadius: 3,
            padding: 0,
            margin: 2,
            marginBottom: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            overflow: 'hidden',
          }}
        >
          {finalMenuItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <TouchableOpacity
                style={[styles.menuItem]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: item.id === 'logout' ? '#FFEEEE' : '#F5F8FA' }]}>
                  <Ionicons name={item.icon} size={18} color={item.color || COLORS.ACCENT} />
                </View>
                <Text style={[styles.menuText, item.color ? { color: item.color } : {}]}>
                  {item.title}
                </Text>
                {item.id !== 'logout' && (
                  <Ionicons name="chevron-forward" size={18} color={COLORS.TEXT_SECONDARY} />
                )}
              </TouchableOpacity>
              {index < finalMenuItems.length - 1 && (
                <Divider sx={{ marginLeft: 20, marginRight: 20 }} />
              )}
            </React.Fragment>
          ))}
        </Paper>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#FFFEFC',
  },
  container: {
    backgroundColor: '#FFFEFC',
    paddingBottom: SPACING.MEDIUM,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.MEDIUM,
  },
  userName: {
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    fontFamily: FONTS.INSTRUMENT_SANS,
    marginBottom: SPACING.XSMALL,
  },
  userEmail: {
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  statsWrapper: {
    paddingTop: SPACING.SMALL,
    paddingBottom: SPACING.MEDIUM,
  },
  statsTitle: {
    fontSize: FONT_SIZES.SMALL,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    paddingHorizontal: SPACING.LARGE,
    marginBottom: SPACING.SMALL,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.MEDIUM,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: SPACING.SMALL,
    flex: 1,
  },
  statIcon: {
    marginBottom: SPACING.XSMALL / 2,
  },
  statNumber: {
    fontSize: FONT_SIZES.REGULAR,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    fontFamily: FONTS.INSTRUMENT_SANS,
    marginBottom: SPACING.XSMALL / 2,
  },
  statLabel: {
    fontSize: FONT_SIZES.XSMALL,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: FONTS.INSTRUMENT_SANS,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFEFC',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.SMALL + 4,
    paddingHorizontal: SPACING.LARGE,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.MEDIUM,
  },
  menuText: {
    flex: 1,
    fontSize: FONT_SIZES.SMALL,
    color: COLORS.TEXT_PRIMARY,
    fontFamily: FONTS.INSTRUMENT_SANS,
    fontWeight: '500',
  },
  loadingText: {
    fontSize: FONT_SIZES.REGULAR,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: FONTS.INSTRUMENT_SANS,
    marginTop: SPACING.LARGE,
  }
});