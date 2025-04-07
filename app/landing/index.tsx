import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';

// import Logo from '../../components/Logo';
import Logo from '../../assets/images/Logo.svg';
import FondoFinal from '../../assets/images/FondoFinal.svg';
import Landing1 from '../../assets/images/landing1.svg';
import Landing2 from '../../assets/images/landing2.svg';
import Landing3 from '../../assets/images/landing3.svg';
import PaginationIndicator from '../../components/landing/PaginationIndicator';
import Button from '../../components/landing/Button';
import DecantPopup from '../../components/landing/DecantPopup';

const { width, height } = Dimensions.get('window');
const DESKTOP_BREAKPOINT = 768;

export default function LandingScreen() {
  const router = useRouter();
  const isDesktop = Platform.OS === 'web' && width >= DESKTOP_BREAKPOINT;
  const [currentPage, setCurrentPage] = useState(0);
  const [showDecantPopup, setShowDecantPopup] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const logoWidth = isDesktop ? width * 0.15 : width * 0.25;
  const svgHeight = isDesktop ? '25%' : '18%';

  const handlePrimaryButtonPress = () => {
    if (currentPage < 2) {
      const nextPage = currentPage + 1;
      // Update state immediately
      setCurrentPage(nextPage);
      // Scroll to the next page
      scrollViewRef.current?.scrollTo({ x: width * nextPage, animated: true });
    } else {
      // On last page, navigate to survey
      router.push('/survey/1');
    }
  };

  const handleSkipPress = () => {
    router.push('/manual-box');
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
      image: Landing1,
    },
    {
      title: "Ordena un Box de muestras personalizadas",
      description: "Te enviaremos un box con decants según tus gustos. Elige formatos de 3, 5 o 10 ml y 4 u 8 decants. ¡Puedes cambiarlos si quieres!",
      image: Landing2,
    },
    {
      title: "Califica y mejora tus recomendaciones",
      description: "Evalúa tus fragancias y nuestro algoritmo ajustará tus sugerencias para que descubras nuevos aromas.",
      image: Landing3,
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
            {page.image && (
              <page.image
                width={width * 0.9}
                height={height * 0.37}
                style={styles.mainImage}
                preserveAspectRatio="xMidYMid meet"
              />
            )}
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
      <View style={[
        styles.bottomContainer,
        currentPage < 2 && styles.bottomContainerFirstTwo
      ]}>
        <Button
          title={getPrimaryButtonTitle()}
          onPress={handlePrimaryButtonPress}
          primary
        />
        {currentPage === 2 && (
          <Button
            title="Elegir mis decants"
            onPress={handleSkipPress}
            primary={false}
          />
        )}
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
    fontSize: 22,
    marginTop: 2,
    textAlign: 'center',
  },
  mainImage: {
    marginTop: 0,
  },
  contentContainer: {
    width: width * 0.9,
    alignItems: 'center',
    marginTop: 0,
    flexGrow: 1, // Ensure it can expand
    flexShrink: 1, // Prevent excessive shrinking
  },
  title: {
    fontFamily: 'InstrumentSans',
    fontWeight: 'bold',
    fontSize: 22,
    color: '#222222',
    lineHeight: 22*1.2,
    textAlign: 'center',
    marginBottom: 15,
  },
  descriptionWrapper: {
    width: '100%', // Allow full width
    minHeight: 10, // Ensures text area has enough space
    justifyContent: 'center', // Ensures text is aligned properly
  },
  description: {
    fontFamily: 'InstrumentSans',
    fontWeight: 'regular',
    fontSize: 18,
    lineHeight: 16 * 1.4, // Increase for better readability
    textAlign: 'center',
    color: '#717171',
    flexWrap: 'wrap', // Allow text wrapping
    minHeight: 60, // Ensures enough space for multiple lines
  },
  linkText: {
    fontFamily: 'InstrumentSans',
    fontSize: 18,
    fontWeight: 500,
    color: '#0000EE',
    textDecorationLine: 'underline',
  },
  bottomContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  bottomContainerFirstTwo: {
    marginBottom: 30, // This will move the button up on first two screens
  },
});