import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

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
  const firstIconRef = useRef<View>(null);
  const secondIconRef = useRef<View>(null);
  const [firstIconPosition, setFirstIconPosition] = useState(0);
  const [secondIconPosition, setSecondIconPosition] = useState(0);
  const containerRef = useRef<View>(null);

  useEffect(() => {
    const measureTabs = () => {
      if (!containerRef.current) return;

      containerRef.current.measure?.((_x, _y, _width, _height, containerX, _pageY) => {
        if (firstIconRef.current && secondIconRef.current) {
          firstIconRef.current.measure?.((_x, _y, _width, _height, iconX, _pageY) => {
            setFirstIconPosition(iconX - containerX);
          });
          secondIconRef.current.measure?.((_x, _y, _width, _height, iconX, _pageY) => {
            setSecondIconPosition(iconX - containerX);
          });
        }
        if (firstTabRef.current && secondTabRef.current) {
          firstTabRef.current.measure?.((_x, _y, width, _height, _pageX, _pageY) => {
            setFirstTabWidth(width - 35);
          });
          secondTabRef.current.measure?.((_x, _y, width, _height, _pageX, _pageY) => {
            setSecondTabWidth(width - 35);
          });
        }
      });
    };

    // Initial measurement
    measureTabs();

    // Add a small delay to ensure layout is complete
    const timer = setTimeout(measureTabs, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Initial animation to set the line position
    Animated.spring(lineAnim, {
      toValue: activeTab === 'aibox' ? 0 : 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
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
    <View ref={containerRef} style={[styles.tabContainer, isDesktop && styles.desktopTabContainer]}>
      <TouchableOpacity
        style={styles.tab}
        onPress={() => handleTabPress('aibox')}
      >
        <View ref={firstTabRef} style={styles.tabContent}>
          <View ref={firstIconRef}>
            <Feather
              name="user"
              size={24}
              color={activeTab === 'aibox' ? '#000000' : '#AEAEAE'}
              style={styles.tabIcon}
            />
          </View>
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
          <View ref={secondIconRef}>
            <Feather
              name="gift"
              size={24}
              color={activeTab === 'giftbox' ? '#000000' : '#AEAEAE'}
              style={styles.tabIcon}
            />
          </View>
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
                outputRange: [firstIconPosition, secondIconPosition]
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
    marginBottom: 10,
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
    paddingBottom: 0,
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
    borderRadius: 10,
    width: '100%',
  },
});