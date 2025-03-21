import React, { useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, Animated, View } from 'react-native';
import { useRouter } from 'expo-router';
import Logo from '../../assets/images/Logo.svg';

export default function CompleteScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const { width } = Dimensions.get('window');

  useEffect(() => {
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        router.replace('/(tabs)');
      });
    }, 2000); // Show for 2 seconds before transitioning
  }, [fadeAnim, router]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Logo width={width*0.3} height="auto" preserveAspectRatio="xMidYMid meet" />
      <Animated.Text style={[styles.welcomeText, { opacity: fadeAnim }]}>
        Bienvenido
      </Animated.Text>
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
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 20,
    fontFamily: 'InstrumentSerif',
  },
});
