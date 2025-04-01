import React, { useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import Logo from '../../assets/images/Logo.svg';

export default function CompleteScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const { width } = Dimensions.get('window');
  const isDesktop = width >= 768;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              tension: 50,
              friction: 7,
              useNativeDriver: true,
            }),
    ]).start();

    // Exit animation after delay
    setTimeout(() => {
      Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }).start(() => {
              // Redirect to home after survey completion
              router.replace('/home');
            });
    }, 2000);
  }, [fadeAnim, scaleAnim, router]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.View style={[
        styles.contentContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }
      ]}>
        <Logo
          width={isDesktop ? width * 0.07 : width * 0.15}
          height="auto"
          preserveAspectRatio="xMidYMid meet"
        />
        <Animated.Text style={[styles.welcomeText]}>
          Bienvenido
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CBCBCB',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.82,
  },
  contentContainer: {
    position: 'absolute',
    alignItems: 'center',
    gap: 30,
  },
  welcomeText: {
    fontSize: 52,
    fontWeight: '400',
    color: '#1A1A1A',
    fontFamily: 'InstrumentSerifItalic',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
