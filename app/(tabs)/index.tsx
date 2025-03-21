import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, useWindowDimensions, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Logo from '../../assets/images/Logo.svg';
import AIBoxScreen from './aibox';
import GiftBoxScreen from './giftbox';

const DESKTOP_BREAKPOINT = 768;

type TabType = 'aibox' | 'giftbox';

export default function HomeScreen() {
  const router = useRouter();
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
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.logoContainer}>
          <Logo width={isDesktop ? 160 : 120} height="auto" preserveAspectRatio="xMidYMid meet" />
        </View>

        {/* Tab Navigation */}
        <View style={[styles.tabContainer, isDesktop && styles.desktopTabContainer]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'aibox' && styles.activeTab]}
            onPress={() => setActiveTab('aibox')}
          >
            <Text style={[styles.tabText, activeTab === 'aibox' && styles.activeTabText]}>
              AI Box
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'giftbox' && styles.activeTab]}
            onPress={() => setActiveTab('giftbox')}
          >
            <Text style={[styles.tabText, activeTab === 'giftbox' && styles.activeTabText]}>
              Gift Box
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'aibox' ? <AIBoxScreen /> : <GiftBoxScreen />}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFEFC',
    paddingTop: Platform.OS === 'web' ? 80 : 60,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 40,
  },
  desktopWelcomeText: {
    fontSize: 32,
    marginBottom: 60,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 10,
  },
  desktopTabContainer: {
    gap: 20,
    marginBottom: 40,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  tabContentText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
});
