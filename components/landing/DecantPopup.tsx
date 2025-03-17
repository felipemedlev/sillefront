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
            <Animated.View
              style={[
                styles.popupContainer,
                { opacity: fadeAnim }
              ]}
            >
              <View style={styles.header}>
                <Text style={styles.title}>¿Qué es un decant?</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Image
                source={require('../../assets/images/decant-general.png')}
                style={styles.image}
                resizeMode="contain"
              />

              <Text style={styles.description}>
                Un decant es una muestra de perfume original transferida a un frasco más pequeño.
                Esto te permite probar diferentes fragancias sin tener que comprar botellas completas.
                Nuestros decants vienen en tamaños de 3, 5 o 10 ml, perfectos para descubrir nuevas fragancias.
              </Text>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    width: width * 0.85,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
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
  image: {
    width: '80%',
    height: 150,
    marginVertical: 15,
  },
  description: {
    fontFamily: 'InstrumentSans',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#333333',
  },
});

export default DecantPopup;