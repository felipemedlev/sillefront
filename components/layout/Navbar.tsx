// components/layout/Navbar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname.includes(path);
  };

  return (
    <View style={styles.navbar}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push('/store')}
      >
        <Feather
          name="home"
          size={24}
          color={isActive('/store') && !pathname.includes('/store/') ? '#333' : '#888'}
        />
        <Text style={[styles.navText, isActive('/store') && !pathname.includes('/store/') && styles.activeText]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push('/store/search')}
      >
        <Feather
          name="search"
          size={24}
          color={isActive('/search') ? '#333' : '#888'}
        />
        <Text style={[styles.navText, isActive('/search') && styles.activeText]}>Search</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push('/store/decant-box')}
      >
        <Feather
          name="package"
          size={24}
          color={isActive('/decant-box') ? '#333' : '#888'}
        />
        <Text style={[styles.navText, isActive('/decant-box') && styles.activeText]}>Decants</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push('/store/cart')}
      >
        <Feather
          name="shopping-cart"
          size={24}
          color={isActive('/cart') ? '#333' : '#888'}
        />
        <Text style={[styles.navText, isActive('/cart') && styles.activeText]}>Cart</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push('/store/profile')}
      >
        <Feather
          name="user"
          size={24}
          color={isActive('/profile') ? '#333' : '#888'}
        />
        <Text style={[styles.navText, isActive('/profile') && styles.activeText]}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    height: 60,
    paddingBottom: 5,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  navText: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  activeText: {
    color: '#333',
    fontWeight: '500',
  },
});

export default Navbar;