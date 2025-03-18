import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import Logo from '../assets/images/Logo.svg';

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(1)).current; // Initial opacity is 1

  useEffect(() => {
    // Start fade-out animation
    Animated.timing(fadeAnim, {
      toValue: 0, // Fades out completely
      duration: 1000, // 1 second fade duration
      useNativeDriver: true, // Optimize animation
    }).start(() => {
      router.replace('./landing'); // Navigate after fade-out
    });
  }, [fadeAnim, router]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Logo width={100} height="auto" preserveAspectRatio="xMidYMid meet" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFEFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
