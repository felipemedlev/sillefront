import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  TouchableWithoutFeedback,
  Animated
} from 'react-native';
import { useMediaQuery } from 'react-responsive';

interface DecantPopupProps {
  visible: boolean;
  onClose: () => void;
}

const DecantPopup = ({ visible, onClose }: DecantPopupProps) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const isDesktop = useMediaQuery({ minWidth: 768 });

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View style={[
              styles.popupContainer,
              isDesktop && styles.desktopPopupContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}>

              {/* Header with Title and Close Button */}
              <View style={styles.header}>
                <Text style={styles.title}>¿Qué es un decant?</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <View style={styles.closeIconContainer}>
                    <Text style={styles.closeButtonText}>×</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Content Divider */}
              <View style={styles.divider} />

              {/* Image & Description Layout */}
              <View style={styles.contentContainer}>
                {/* Left Side - Image */}
                <View style={styles.imageContainer}>
                  <Image
                    source={require('../../assets/images/decant-general.png')}
                    style={[styles.image, isDesktop && styles.desktopImage]}
                    resizeMode="contain"
                  />
                </View>

                {/* Right Side - Text */}
                <View style={styles.textContainer}>
                  <Text style={[styles.description, isDesktop && styles.desktopDescription]}>
                    Un <Text style={styles.bold}>decant</Text> es una muestra de perfume original transferida a un frasco más pequeño.
                  </Text>

                  <Text style={[styles.description, styles.spacedParagraph, isDesktop && styles.desktopDescription]}>
                    Contamos con formatos de <Text style={styles.bold}>3, 5 o 10 ml</Text>, perfectos para descubrir nuevas fragancias.
                  </Text>
                </View>
              </View>

            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    width: width * 0.9,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5,
  },
  desktopPopupContainer: {
    width: Math.min(width * 0.6, 600),
    maxWidth: 600,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontFamily: 'InstrumentSans',
    fontWeight: '600',
    fontSize: 22,
    color: '#1A1A1A',
    paddingRight: 15,
  },
  closeButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
    lineHeight: 28,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 16,
    width: '100%',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  imageContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: 150,
  },
  textContainer: {
    width: 220,
    paddingLeft: 5,
  },
  description: {
    fontFamily: 'InstrumentSans',
    fontSize: 16,
    lineHeight: 22,
    color: '#333333',
  },
  spacedParagraph: {
    marginTop: 16,
  },
  bold: {
    fontWeight: '700',
    color: '#000000',
  },
  desktopImage: {
    height: height * 0.28,
  },
  desktopDescription: {
    fontSize: 17,
    lineHeight: 24,
  },
});

export default DecantPopup;