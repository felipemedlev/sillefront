import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, useWindowDimensions, Platform, ScrollView } from 'react-native';
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

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'aibox' ? <AIBoxScreen /> : <GiftBoxScreen />}
        </ScrollView>
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
    padding: 16,
    paddingTop: 0,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 0,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
});
