import React, { useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import Logo from '../assets/images/Logo.svg';


export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(1)).current; // Initial opacity is 1
  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        router.replace('/landing');
      });
    }, 500); // Extra delay before starting fade
  }, [fadeAnim, router]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Logo width={width*0.3} preserveAspectRatio="xMidYMid meet" />
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
