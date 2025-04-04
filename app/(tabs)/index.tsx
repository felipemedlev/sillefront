import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, useWindowDimensions, Platform } from 'react-native';
import AIBoxScreen from './aibox';
import GiftBoxScreen from './giftbox';
import TabNavigation from '../components/TabNavigation';

const DESKTOP_BREAKPOINT = 768;

type TabType = 'aibox' | 'giftbox';

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [activeTab, setActiveTab] = useState<TabType>('aibox');

  useEffect(() => {
    Animated.parallel([
      Animated.spring(fadeAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
    ]).start();
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <TabNavigation
          activeTab={activeTab}
          onTabPress={setActiveTab}
          isDesktop={isDesktop}
        />
        {/* Removed ScrollView wrapper */}
        <View style={[
          styles.screenContainer,
          isDesktop && styles.screenContainerWeb
        ]}>
          {activeTab === 'aibox' ? <AIBoxScreen /> : <GiftBoxScreen />}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'web' ? '5%' : 0,
    backgroundColor: '#FFFEFC',
  },
  content: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    // Removed padding: 16, let screenContainer handle padding if needed
    // paddingTop: 0, // Already removed by TabNavigation positioning
  },
  screenContainer: { // New style for the container holding the active screen
    flex: 1, // Allow the screen content to take available space
    width: '100%', // Ensure the screen content spans the width
    // alignItems: 'center', // Remove default alignment, let screen decide
    // justifyContent: 'flex-start', // Remove default justification
    padding: 16, // Add padding here if needed globally for both screens
    paddingTop: 0, // Adjust as needed
  },
  // Removed scrollView and scrollViewContent styles
  screenContainerWeb: {
    width: '70%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
});
