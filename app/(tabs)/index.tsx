import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import AIBoxScreen from './aibox';
import GiftBoxScreen from './giftbox';
import TabNavigation from '../components/TabNavigation';
import { ResponsiveContainer } from '../../components/layout/ResponsiveContainer';
import { shouldUseNativeDriver } from '../../src/utils/animation';
import { useResponsive } from '../../src/utils/responsive';

type TabType = 'aibox' | 'giftbox';

export default function HomeScreen() {
  const { isDesktop, isLargeDesktop, padding } = useResponsive();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [activeTab, setActiveTab] = useState<TabType>('aibox');
  
  const topPadding = Platform.OS === 'web' && isDesktop
    ? (isLargeDesktop ? 120 : 100) 
    : 0;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(fadeAnim, {
        toValue: 1,
        useNativeDriver: shouldUseNativeDriver,
        tension: 50,
        friction: 7,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: shouldUseNativeDriver,
        tension: 50,
        friction: 7,
      }),
    ]).start();
  });

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <TabNavigation
          activeTab={activeTab}
          onTabPress={setActiveTab}
          isDesktop={isDesktop}
        />
        <ResponsiveContainer 
          style={styles.screenContainer}
          padding={true}
        >
          {activeTab === 'aibox' ? <AIBoxScreen /> : <GiftBoxScreen />}
        </ResponsiveContainer>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFEFC',
  },
  content: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
  },
  screenContainer: {
    flex: 1,
    width: '100%',
  },
});
