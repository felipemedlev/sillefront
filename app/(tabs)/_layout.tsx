// app/(tabs)/_layout.tsx
import React from 'react';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';
import { Tabs } from 'expo-router';
import { Svg, Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import FondoFinal from '../../assets/images/FondoFinal.svg';

const DESKTOP_BREAKPOINT = 768;

export default function TabsLayout() {
  const { width, height } = Dimensions.get('window');
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const svgHeight = Platform.OS === 'web' ? '26%' : '20%';

  return (
    <View style={styles.container}>
      {/* Background SVG wrapper */}
      <View style={styles.svgBackground}>
        <Svg width="100%" height="300" viewBox="0 0 100 100" preserveAspectRatio="none">
          <Path
            d="M0 0 Q 50 40 100 0 L100 0 L0 0"
            fill="#e9e3db"
          />
        </Svg>
      </View>

      {/* Content container */}
      <View style={styles.content}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              position: 'absolute',
              ...(Platform.OS === 'web' ? {
                top: isDesktop ? 20 : 10,
                left: isDesktop ? 50 : 10,
                right: isDesktop ? 50 : 10,
              } : {
                bottom: 20,
                left: 10,
                right: 10,
              }),
              elevation: 0,
              backgroundColor: '#FFFFFF',
              borderTopWidth: 1,
              borderTopColor: '#CAC9C9',
              borderRadius: isDesktop ? 43 : 43,
              height: isDesktop ? 60 : 70,
              paddingTop: isDesktop ? 0 : 10,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: Platform.OS === 'web' ? 1 : -1,
              },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              ...Platform.select({
                ios: {
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: -2,
                  },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                },
                android: {
                  elevation: 3,
                },
                web: {
                  borderBottomWidth: 0.5,
                  borderBottomColor: '#CAC9C9',
                },
              }),
            },
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: '#666',
            tabBarLabelStyle: {
              fontSize: isDesktop ? 14 : 12,
              fontWeight: '500',
            },
            tabBarIconStyle: {
              marginBottom: isDesktop ? 0 : 5,
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Inicio',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" size={isDesktop ? size + 4 : size} color={color} />
              ),
              href: '/home', // Explicitly set home route
            }}
          />
          <Tabs.Screen
            name="(search)"
            options={{
              title: 'Buscar',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="search" size={isDesktop ? size + 4 : size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="(cart)"
            options={{
              title: 'Carrito',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="cart" size={isDesktop ? size + 4 : size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="(ratings)"
            options={{
              title: 'Ratings',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="star" size={isDesktop ? size + 4 : size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="(profile)"
            options={{
              title: 'Perfil',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person" size={isDesktop ? size + 4 : size} color={color} />
              ),
            }}
          />
          {/* Hidden screens not shown in the tab bar */}
          <Tabs.Screen
            name="aibox"
            options={{
              href: null,
              tabBarItemStyle: { display: 'none' },
            }}
          />
          <Tabs.Screen
            name="giftbox"
            options={{
              href: null,
              tabBarItemStyle: { display: 'none' },
            }}
          />
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'white', // Add this to ensure white background below the curve
  },
  svgBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300, // Adjust this value to control the height of the curve
    zIndex: 0,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});