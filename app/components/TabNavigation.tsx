import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { shouldUseNativeDriver } from '../../src/utils/animation';

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
            setFirstTabWidth(width - 29);
          });
          secondTabRef.current.measure?.((_x, _y, width, _height, _pageX, _pageY) => {
            setSecondTabWidth(width - 29);
          });
        }
      });
    };

    measureTabs();
    const timer = setTimeout(measureTabs, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    Animated.spring(lineAnim, {
      toValue: activeTab === 'aibox' ? 0 : 1,
      useNativeDriver: shouldUseNativeDriver,
      tension: 65,
      friction: 10,
    }).start();
  }, [activeTab, lineAnim]);

  const handleTabPress = (tab: TabType) => {
    onTabPress(tab);
    Animated.spring(lineAnim, {
      toValue: tab === 'aibox' ? 0 : 1,
      useNativeDriver: shouldUseNativeDriver,
      tension: 65,
      friction: 10,
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
              size={20}
              color={activeTab === 'aibox' ? '#809CAC' : '#717171'}
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
              size={20}
              color={activeTab === 'giftbox' ? '#809CAC' : '#717171'}
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
    marginBottom: 8,
    width: '100%',
    position: 'relative',
    alignSelf: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  desktopTabContainer: {
    maxWidth: 600,
    marginBottom: 24,
    marginTop: 24,
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    width: 'auto',
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 18,
    color: '#717171',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
    fontWeight: '500',
  },
  activeTabText: {
    color: '#809CAC',
    fontWeight: '600',
  },
  tabLine: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    height: 2,
    backgroundColor: '#809CAC',
    borderRadius: 2,
  },
});