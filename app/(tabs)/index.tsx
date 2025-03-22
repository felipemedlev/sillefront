import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, useWindowDimensions, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
  const lineAnim = useRef(new Animated.Value(0)).current;

  const handleTabPress = (tab: TabType) => {
    setActiveTab(tab);
    Animated.spring(lineAnim, {
      toValue: tab === 'aibox' ? 0 : 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

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
        {/* Tab Navigation */}
        <View style={[styles.tabContainer, isDesktop && styles.desktopTabContainer]}>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => handleTabPress('aibox')}
          >
            <View style={styles.tabContent}>
              <Ionicons
                name="person-circle-outline"
                size={24}
                color={activeTab === 'aibox' ? '#000000' : '#AEAEAE'}
                style={styles.tabIcon}
              />
              <Text style={[styles.tabText, activeTab === 'aibox' && styles.activeTabText]}>
                Personalizados
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tab}
            onPress={() => handleTabPress('giftbox')}
          >
            <View style={styles.tabContent}>
              <Ionicons
                name="gift-outline"
                size={24}
                color={activeTab === 'giftbox' ? '#000000' : '#AEAEAE'}
                style={styles.tabIcon}
              />
              <Text style={[styles.tabText, activeTab === 'giftbox' && styles.activeTabText]}>
                Regalo
              </Text>
            </View>
          </TouchableOpacity>

          {/* Animated underline */}
          <Animated.View
            style={[
              styles.tabLine,
              {
                transform: [{
                  translateX: lineAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })
                }]
              }
            ]}
          />
        </View>

        {/* Tab Content */}
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
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 25,
    gap: 40,
    width: '100%',
    position: 'relative',
    alignSelf: 'center',
    maxWidth: 600,
    paddingHorizontal: 20,
  },
  desktopTabContainer: {
    gap: 60,
    marginBottom: 30,
    marginTop: 30,
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 0,
    flex: 1,
    position: 'relative',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
    width: '100%',
  },
  tabIcon: {
    marginRight: 8,
    marginBottom: 8,
  },
  tabText: {
    fontSize: 20,
    color: '#AEAEAE',
    fontFamily: 'InstrumentSans',
    fontWeight: '700',
    marginBottom: 8,
  },
  activeTabText: {
    color: '#000000',
  },
  tabLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '50%',
    height: 2,
    backgroundColor: '#000000',
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
});
