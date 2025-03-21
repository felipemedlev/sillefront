// app/(tabs)/_layout.tsx
import React from 'react';
import { View, StyleSheet, Platform, useColorScheme } from 'react-native';
import { useWindowDimensions } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const DESKTOP_BREAKPOINT = 768;

export default function TabsLayout() {
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            top: isDesktop ? 20 : 10,
            left: isDesktop ? 50 : 10,
            right: isDesktop ? 50 : 10,
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
              height: 1,
            },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
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
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFEFC',
    paddingTop: Platform.select({
      ios: 70,
      android: 70,
      web: 0,
    }),
  },
});
