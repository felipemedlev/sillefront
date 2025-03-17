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

interface DecantPopupProps {
  visible: boolean;
  onClose: () => void;
}

const DecantPopup = ({ visible, onClose }: DecantPopupProps) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

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
            <Animated.View style={[styles.popupContainer, { opacity: fadeAnim }]}>

              {/* Header with Title and Close Button */}
              <View style={styles.header}>
                <Text style={styles.title}>¿Qué es un decant?</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>x</Text>
                </TouchableOpacity>
              </View>

              {/* Image & Description Layout */}
              <View style={styles.contentContainer}>
                {/* Left Side - Image */}
                <Image
                  source={require('../../assets/images/decant-general.png')}
                  style={styles.image}
                  resizeMode="contain"
                />

                {/* Right Side - Text */}
                <View style={styles.textContainer}>
                  <Text style={styles.description}>
                    Un <Text style={styles.bold}>decant</Text> es una muestra de perfume original transferida a un frasco más pequeño.{"\n\n"}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    width: width * 0.9,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontFamily: 'InstrumentSans',
    fontWeight: 'bold',
    fontSize: 20,
    color: '#000000',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 22,
    color: '#000000',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  image: {
    width: width * 0.3,  // 30% of screen width
    height: height * 0.25, // 30% of screen height
    marginRight: width * 0.01, // Add spacing relative to width
  },
  textContainer: {
    flex: 1, // Takes remaining space
  },
  description: {
    fontFamily: 'InstrumentSans',
    fontSize: width * 0.04, // Scales based on screen width
    lineHeight: width * 0.06,
    textAlign: 'left',
    color: '#333333',
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default DecantPopup;