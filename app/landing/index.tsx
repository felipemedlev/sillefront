import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Platform,
  Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@mui/material';

// import Logo from '../../components/Logo';
import Logo from '../../assets/images/Logo.svg';
import FondoFinal from '../../assets/images/FondoFinal.svg';
import Landing1 from '../../assets/images/landing1.svg';
import Landing2 from '../../assets/images/landing2.svg';
import Landing3 from '../../assets/images/landing3.svg';
import PaginationIndicator from '../../components/landing/PaginationIndicator';
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

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Reset fade animation when page changes
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentPage]);

  const handlePrimaryButtonPress = () => {
    if (currentPage < 2) {
      // Start fade out animation
      setIsTransitioning(true);
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        const nextPage = currentPage + 1;
        // Update state immediately
        setCurrentPage(nextPage);
        // Scroll to the next page with smooth animation
        scrollViewRef.current?.scrollTo({
          x: width * nextPage,
          animated: true
        });

        // Fade back in after a short delay
        setTimeout(() => {
          setIsTransitioning(false);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }, 100);
      });
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

    // Only update if page actually changed
    if (page !== currentPage) {
      // Start fade out animation
      setIsTransitioning(true);
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentPage(page);

        // Fade back in after a short delay
        setTimeout(() => {
          setIsTransitioning(false);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }, 100);
      });
    }
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
        decelerationRate="fast"
        snapToInterval={width}
        snapToAlignment="center"
      >
        {landingData.map((page, index) => (
          <View key={index} style={styles.pageContainer}>
            <Animated.View style={{
              opacity: fadeAnim,
              width: '100%',
              alignItems: 'center'
            }}>
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
            </Animated.View>
          </View>
        ))}
      </ScrollView>
      <View style={[
        styles.bottomContainer,
        currentPage < 2 && styles.bottomContainerFirstTwo
      ]}>
        <Button
          variant="contained"
          color="primary"
          onClick={handlePrimaryButtonPress}
          disabled={isTransitioning}
          sx={{
            width: 200,
            marginBottom: '10px'
          }}
        >
          {getPrimaryButtonTitle()}
        </Button>
        {currentPage === 2 && (
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleSkipPress}
            disabled={isTransitioning}
            sx={{
              width: 200,
            }}
          >
            Elegir mis decants
          </Button>
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