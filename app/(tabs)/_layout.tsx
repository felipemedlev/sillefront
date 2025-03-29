// app/(tabs)/_layout.tsx
import React from 'react';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const DESKTOP_BREAKPOINT = 768;

export default function TabsLayout() {
  const { width } = Dimensions.get('window');
  const isDesktop = width >= DESKTOP_BREAKPOINT;
return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Tabs
          screenOptions={{
              headerShown: false,
              tabBarShowLabel: !isDesktop,
              tabBarStyle: {
                position: 'absolute',
                ...(Platform.OS === 'web' ? {
                  ...(isDesktop ? {
                    top: 20,
                    left: 50,
                    right: 50,
                    height: 50,
                    borderRadius: 43,
                    paddingTop: 0,
                  } : {
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 60,
                    borderTopWidth: 1,
                    borderTopColor: '#E5E5E5',
                    borderRadius: 0,
                    paddingTop: 0,
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.05)',
                    elevation: 5,
                  }),
                } : {
                  bottom: 20,
                  left: 10,
                  right: 10,
                  height: 70,
                  borderRadius: 43,
                  paddingTop: 10,
                }),
                elevation: 0,
                backgroundColor: '#FFFFFF',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                zIndex: 999,
                ...Platform.select({
                  ios: {
                    boxShadow: '0 -2px 3px rgba(0, 0, 0, 0.1)',
                  },
                  android: {
                    elevation: 3,
                  },
                  web: {
                    borderBottomWidth: isDesktop ? 1 : 0,
                    borderBottomColor: '#CAC9C9',
                  },
                }),
              },
              tabBarActiveTintColor: '#000000',
              tabBarInactiveTintColor: '#999999',
              tabBarLabelStyle: {
                fontSize: isDesktop ? 14 : 11,
                fontWeight: '400',
                marginTop: 0,
                marginBottom: Platform.OS === 'web' ? 8 : 4,
              },
              tabBarIconStyle: {
                marginTop: 0,
                marginBottom: 0,
              },
              tabBarItemStyle: {
                paddingVertical: 0,
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              },
            }}
          >
            <Tabs.Screen
              name="index"
              options={{
                title: 'Inicio',
                tabBarIcon: ({ color, size }) => (
                  <Feather name="home" size={isDesktop ? size + 4 : size} color={color} />
                ),
                href: '/home',
              }}
            />
            <Tabs.Screen
              name="(search)"
              options={{
                title: 'Buscar',
                tabBarIcon: ({ color, size }) => (
                  <Feather name="search" size={isDesktop ? size + 4 : size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="(ratings)"
              options={{
                title: 'Ratings',
                tabBarIcon: ({ color, size }) => (
                  <Feather name="star" size={isDesktop ? size + 4 : size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="(cart)"
              options={{
                title: 'Carrito',
                tabBarIcon: ({ color, size }) => (
                  <Feather name="shopping-cart" size={isDesktop ? size + 4 : size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="(profile)"
              options={{
                title: 'Perfil',
                tabBarIcon: ({ color, size }) => (
                  <Feather name="user" size={isDesktop ? size + 4 : size} color={color} />
                ),
              }}
            />
            {/* Hidden screens */}
            <Tabs.Screen name="aibox" options={{ href: null, tabBarItemStyle: { display: 'none' } }} />
            <Tabs.Screen name="giftbox" options={{ href: null, tabBarItemStyle: { display: 'none' } }} />
          </Tabs>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    position: 'relative',
    zIndex: 2,
    paddingBottom: Platform.OS === 'web' ? 0 : 0,
  },
  svgBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
});