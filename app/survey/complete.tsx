import React, { useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, Animated, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Logo from '../../assets/images/Logo.svg';
import { useSurveyContext } from '../../context/SurveyContext';
import { useAuth } from '../../src/context/AuthContext';

export default function CompleteScreen() {
  const router = useRouter();
  const { submitSurveyIfAuthenticated } = useSurveyContext();
  const { isAuthenticated } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const { width } = Dimensions.get('window');
  const isDesktop = width >= 768;

  useEffect(() => {
    // Always attempt survey submission (will handle authentication internally)
    submitSurveyIfAuthenticated();

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

    // Exit animation after delay - redirect to auth gate for recommendations
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        if (isAuthenticated) {
          // Authenticated users go straight to home
          router.replace('/home');
        } else {
          // Anonymous users see auth prompt to access recommendations
          router.replace('/survey-auth-gate');
        }
      });
    }, 2000);
  }, [fadeAnim, scaleAnim, router, submitSurveyIfAuthenticated, isAuthenticated]);

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
          height={isDesktop ? width * 0.02 : width * 0.045}
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
