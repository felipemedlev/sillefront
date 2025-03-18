import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
  TouchableOpacity,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';

// import Logo from '../../components/Logo';
import Logo from '../../assets/images/Logo.svg';
import FondoFinal from '../../assets/images/FondoFinal.svg';
import PaginationIndicator from '../../components/landing/PaginationIndicator';
import Button from '../../components/landing/Button';
import DecantPopup from '../../components/landing/DecantPopup';

const { width, height } = Dimensions.get('window');

export default function LandingScreen() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [showDecantPopup, setShowDecantPopup] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const logoWidth = Platform.OS === 'web' && width > 768 ? width * 0.15 : width * 0.3;
  const svgHeight = Platform.OS === 'web' ? '26%' : '20%';

  const handlePrimaryButtonPress = () => {
    if (currentPage < 2) {
      // Go to next page
      scrollViewRef.current?.scrollTo({ x: width * (currentPage + 1), animated: true });
    } else {
      // On last page, navigate to survey
      router.push('/survey/1');
    }
  };

  const handleSkipPress = () => {
    router.push('./registration');
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / width);
    setCurrentPage(page);
  };

  const renderDecantText = (text: string) => {
    const parts = text.split(/(decants)/g);

    return (
      <Text style={styles.description}>
        {parts.map((part, index) =>
          part === "decants" ? (
            <TouchableOpacity key={index} onPress={() => setShowDecantPopup(true)}>
              <Text style={styles.linkText}>{part}</Text>
            </TouchableOpacity>
          ) : (
            <Text key={index}>{part}</Text> // Ensure all parts are wrapped in <Text>
          )
        )}
      </Text>
    );
  };

  const getPrimaryButtonTitle = () => {
    switch (currentPage) {
      case 0:
        return "Comenzar";
      case 1:
        return "Siguiente";
      case 2:
        return "Realizar test inicial";
      default:
        return "Siguiente";
    }
  };

  const landingData = [
    {
      title: "Descubre perfumes según tus gustos",
      description: "Utilizamos inteligencia artificial para encontrar perfumes de acuerdo a tu perfil en base a un test inicial",
      image: require('../../assets/images/decant-1.png'),
    },
    {
      title: "Ordena un Box de muestras personalizadas",
      description: "Te enviaremos un box con decants según tus gustos. Elige formatos de 3, 5 o 10 ml y 4 u 8 decants. ¡Puedes cambiarlos si quieres!",
      image: require('../../assets/images/decant-2.png'),
    },
    {
      title: "Califica y mejora tus recomendaciones",
      description: "Evalúa tus fragancias y nuestro algoritmo ajustará tus sugerencias para que descubras nuevos aromas.",
      image: require('../../assets/images/decant-3.png'),
    },
  ];

  return (
    <View style={styles.container}>
      <FondoFinal
        width={width}
        style={[styles.backgroundSvg, { height: svgHeight }]} // Apply dynamic height
        preserveAspectRatio="none"
      />

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {landingData.map((page, index) => (
          <View key={index} style={styles.pageContainer}>
            <View style={styles.logoContainer}>
              <Logo width={logoWidth} height="auto" preserveAspectRatio="xMidYMid meet" />
              <Text style={styles.slogan}>Descubre perfumes con AI</Text>
            </View>
            <Image
              source={page.image}
              style={styles.mainImage}
              resizeMode="contain"
            />
            <PaginationIndicator totalPages={3} currentPage={currentPage} />
            <View style={styles.contentContainer}>
              <Text style={styles.title}>{page.title}</Text>
              {index === 1 ? (
                <View style={styles.descriptionWrapper}>
                  {renderDecantText(page.description)}
                </View>
              ) : (
                <View style={styles.descriptionWrapper}>
                  <Text style={styles.description}>{page.description}</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.bottomContainer}>
        <Button
          title={getPrimaryButtonTitle()}
          onPress={handlePrimaryButtonPress}
          primary
        />
        <Button
          title="Saltar intro"
          onPress={handleSkipPress}
          primary={false}
        />
      </View>
      <DecantPopup
        visible={showDecantPopup}
        onClose={() => setShowDecantPopup(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#FFFEFC',
  },
  pageContainer: {
    width,
    flex: 1,
    alignItems: 'center',
  },
  backgroundSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%', // Ensure full width
    zIndex: -1,    // Send to background
  },
  logoContainer: {
    marginTop: (height * 0.02), // Positioned inside the top shape
    alignItems: 'center',
    zIndex: 1,
  },
  slogan: {
    fontFamily: 'InstrumentSerifItalic',
    fontSize: 28,
    marginTop: 5,
    textAlign: 'center',
  },
  mainImage: {
    width: width * 0.7,
    height: height * 0.25,
    marginTop: 30,
  },
  contentContainer: {
    width: width * 0.85,
    alignItems: 'center',
    marginTop: 10,
    flexGrow: 1, // Ensure it can expand
    flexShrink: 1, // Prevent excessive shrinking
  },
  title: {
    fontFamily: 'InstrumentSans',
    fontWeight: 'bold',
    fontSize: 24,
    lineHeight: 22*1.2,
    textAlign: 'center',
    marginBottom: 15,
  },
  descriptionWrapper: {
    width: '100%', // Allow full width
    minHeight: 40, // Ensures text area has enough space
    justifyContent: 'center', // Ensures text is aligned properly
  },
  description: {
    fontFamily: 'InstrumentSans',
    fontWeight: 'regular',
    fontSize: 18,
    lineHeight: 16 * 1.4, // Increase for better readability
    textAlign: 'center',
    color: '#333333',
    flexWrap: 'wrap', // Allow text wrapping
    minHeight: 60, // Ensures enough space for multiple lines
  },
  linkText: {
    fontFamily: 'InstrumentSans',
    fontSize: 16,
    color: '#71A983',
    textDecorationLine: 'underline',
  },
  bottomContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 0,
    paddingHorizontal: 20,
  },
});