import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type TabType = 'aibox' | 'giftbox';

interface TabNavigationProps {
  activeTab: TabType;
  onTabPress: (tab: TabType) => void;
  isDesktop: boolean;
}

export default function TabNavigation({ activeTab, onTabPress, isDesktop }: TabNavigationProps) {
  const lineAnim = useRef(new Animated.Value(0)).current;
  const [firstTabWidth, setFirstTabWidth] = useState(0);
  const [secondTabWidth, setSecondTabWidth] = useState(0);
  const firstTabRef = useRef<View>(null);
  const secondTabRef = useRef<View>(null);
  const [firstTabPosition, setFirstTabPosition] = useState(0);
  const [secondTabPosition, setSecondTabPosition] = useState(0);

  useEffect(() => {
    if (firstTabRef.current && secondTabRef.current) {
      firstTabRef.current.measure?.((_x, _y, width, height, pageX, _pageY) => {
        setFirstTabWidth(width);
        setFirstTabPosition(pageX);
      });
      secondTabRef.current.measure?.((_x, _y, width, height, pageX, _pageY) => {
        setSecondTabWidth(width);
        setSecondTabPosition(pageX);
      });
    }
  }, []);

  const handleTabPress = (tab: TabType) => {
    onTabPress(tab);
    Animated.spring(lineAnim, {
      toValue: tab === 'aibox' ? 0 : 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  return (
    <View style={[styles.tabContainer, isDesktop && styles.desktopTabContainer]}>
      <TouchableOpacity
        style={styles.tab}
        onPress={() => handleTabPress('aibox')}
      >
        <View ref={firstTabRef} style={styles.tabContent}>
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
        <View ref={secondTabRef} style={styles.tabContent}>
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

      <Animated.View
        style={[
          styles.tabLine,
          {
            width: lineAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [firstTabWidth, secondTabWidth]
            }),
            transform: [{
              translateX: lineAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [firstTabPosition - 20, secondTabPosition - 20]
              })
            }]
          }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 25,
    width: '100%',
    position: 'relative',
    alignSelf: 'center',
  },
  desktopTabContainer: {
    maxWidth: 600,
    marginBottom: 30,
    marginTop: 30,
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 0,
    position: 'relative',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
    paddingHorizontal: 20,
    width: 'auto',
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
    height: 2,
    backgroundColor: '#000000',
    borderRadius: 2,
  },
});