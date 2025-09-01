import React, { useState } from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { ResponsiveContainer } from '../../components/layout/ResponsiveContainer';
import { useResponsive } from '../../src/utils/responsive';
import {
  Button,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Box,
  MobileStepper,
  useTheme,
  Typography,
  IconButton
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';

// Import SVG Assets
import Logo from '../../assets/images/Logo.svg';
import FondoFinal from '../../assets/images/FondoFinal.svg';
import Landing1 from '../../assets/images/landing1.svg';
import Landing2 from '../../assets/images/landing2.svg';
import Landing3 from '../../assets/images/landing3.svg';
import DecantPopup from '../../components/landing/DecantPopup';

// Define landing page content data type
interface LandingItem {
  title: string;
  description: string;
  image: React.FC<any>;
  buttonText: string;
}

// Landing page content data
const landingData: LandingItem[] = [
  {
    title: "Descubre perfumes según tus gustos",
    description: "Utilizamos inteligencia artificial para encontrar perfumes de acuerdo a tu perfil en base a un test inicial",
    image: Landing1,
    buttonText: "Comenzar",
  },
  {
    title: "Ordena un Box de muestras personalizadas",
    description: "Te enviaremos un box con decants según tus gustos. Elige formatos de 3, 5 o 10 ml y 4 u 8 decants. ¡Puedes cambiarlos si quieres!",
    image: Landing2,
    buttonText: "Siguiente",
  },
  {
    title: "Califica y mejora tus recomendaciones",
    description: "Evalúa tus fragancias y nuestro algoritmo ajustará tus sugerencias para que descubras nuevos aromas.",
    image: Landing3,
    buttonText: "Realizar test inicial",
  },
];

const LandingScreen: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const theme = useTheme();
  const { width, height, isDesktop, isLargeDesktop, getFontSize, getSpacing } = useResponsive();
  const [activeStep, setActiveStep] = useState(0);
  const [showDecantPopup, setShowDecantPopup] = useState(false);
  
  // Responsive sizing
  const logoWidth = isLargeDesktop ? width * 0.12 : isDesktop ? width * 0.15 : width * 0.25;
  const svgHeight = isLargeDesktop ? '30%' : isDesktop ? '25%' : '18%';

  // Handle next step button click
  const handleNext = () => {
    if (activeStep === landingData.length - 1) {
      // On last step, navigate to survey
      router.push('/survey/1');
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  // Handle back button click
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Handle skip button click (on last step)
  const handleSkip = () => {
    router.push('/manual-box');
  };

  // Render decant text with clickable link
  const renderDecantText = (text: string) => {
    return (
      <Typography variant="body1" sx={{
        fontSize: 18,
        textAlign: 'center',
        color: '#717171',
        minHeight: 60,
        lineHeight: 1.4,
      }}>
        {text}
      </Typography>
    );
  };

  // Current step data
  const currentLandingItem = landingData[activeStep];
  const ImageComponent = currentLandingItem.image;

  return (
    <Box sx={{
      height: '100vh',
      width: '100%',
      overflow: 'hidden',
      position: 'relative',
      bgcolor: '#FFFEFC',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Background SVG */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: svgHeight,
        zIndex: 0,
      }}>
        <FondoFinal
          width={width}
          style={{ width: '100%', height: '100%' }}
          preserveAspectRatio="none"
        />
      </Box>

      {/* Logo Section */}
      <Box sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 3,
        zIndex: 1,
        position: 'relative',
      }}>
        {activeStep > 0 && (
          <IconButton
            onClick={handleBack}
            sx={{
              position: 'absolute',
              left: 16,
              top: 16,
              color: '#222222',
            }}
          >
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
        )}

        {/* Authentication Button - Top Right */}
        <Box sx={{
          position: 'absolute',
          right: 16,
          top: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}>
          {isAuthenticated ? (
            <IconButton
              onClick={() => router.push('/(tabs)')}
              sx={{ color: '#222222' }}
              title="Ir a mi perfil"
            >
              <AccountCircleIcon />
            </IconButton>
          ) : (
            <IconButton
              onClick={() => router.push('/(auth)/login')}
              sx={{ color: '#222222' }}
              title="Iniciar sesión"
            >
              <LoginIcon />
            </IconButton>
          )}
        </Box>

        <Logo
          width={logoWidth}
          height={logoWidth * 0.3}
          preserveAspectRatio="xMidYMid meet"
        />
        <Typography
          sx={{
            fontFamily: 'InstrumentSerifItalic',
            fontSize: isLargeDesktop ? 26 : isDesktop ? 24 : 22,
            mt: 0.5,
          }}
        >
          Descubre perfumes con AI
        </Typography>
      </Box>

      {/* Mobile Stepper for small screens */}
      {!isDesktop && (
        <MobileStepper
          variant="dots"
          steps={landingData.length}
          position="static"
          activeStep={activeStep}
          sx={{
            bgcolor: 'transparent',
            mt: 2,
            '& .MuiMobileStepper-dot': {
              mx: 0.5,
            },
            '& .MuiMobileStepper-dotActive': {
              bgcolor: theme.palette.primary.main,
            },
          }}
          nextButton={<Box />}
          backButton={<Box />}
        />
      )}

      {/* Content Section with Transition */}
      <Box sx={{
        flex: 1,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        px: 2,
        mt: 2,
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        overflow: 'auto',
      }}>
        {/* Desktop stepper (horizontal) */}
        {isDesktop && (
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{
              width: isLargeDesktop ? '60%' : '80%',
              mb: 2,
              maxWidth: 600,
            }}
          >
            {landingData.map((_, index) => (
              <Step key={index}>
                <StepLabel></StepLabel>
              </Step>
            ))}
          </Stepper>
        )}

        {/* Main content with image */}
        <Box sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          mb: isDesktop ? 0.5 : 0.5,
          maxWidth: isLargeDesktop ? '50%' : isDesktop ? '70%' : '90%',
          alignSelf: 'center',
        }}>
          <ImageComponent
            width={isLargeDesktop ? width * 0.4 : isDesktop ? width * 0.6 : width * 0.9}
            height={height * (isDesktop ? 0.35 : 0.3)}
            preserveAspectRatio="xMidYMid meet"
          />
        </Box>

        {/* Content text */}
        <View style={[
          styles.contentContainer,
          { 
            width: isLargeDesktop ? '60%' : isDesktop ? '80%' : '90%',
            maxWidth: 800,
            marginBottom: isDesktop ? 8 : 24,
          }
        ]}>
          <Text style={[
            styles.title,
            { 
              fontSize: isLargeDesktop ? 26 : isDesktop ? 24 : 22,
            }
          ]}>
            {currentLandingItem.title}
          </Text>

          <Text style={[
            styles.description,
            { 
              fontSize: isLargeDesktop ? 20 : isDesktop ? 19 : 18,
              minHeight: isDesktop ? 80 : 60,
            }
          ]}>
            {currentLandingItem.description}
          </Text>
        </View>

        {/* Action buttons */}
        <Box sx={{
          width: '100%',
          maxWidth: 400,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: isDesktop ? 1.5 : 'auto',
          mb: isDesktop ? 2 : 4,
          pb: 2,
          alignSelf: 'center',
        }}>
          {/* Show different options for authenticated vs non-authenticated users */}
          {isAuthenticated && activeStep === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <Button
                variant="contained"
                onClick={() => router.push('/(tabs)')}
                sx={{
                  width: isLargeDesktop ? 220 : isDesktop ? 200 : 180,
                  height: isLargeDesktop ? 50 : isDesktop ? 45 : 40,
                  bgcolor: '#222222',
                  fontSize: isLargeDesktop ? 16 : isDesktop ? 15 : 14,
                  textTransform: 'none',
                  lineHeight: 1.2,
                  '&:hover': {
                    bgcolor: '#333333',
                  },
                }}
              >
                Ver mis recomendaciones
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push('/survey/1')}
                sx={{
                  width: isLargeDesktop ? 220 : isDesktop ? 200 : 180,
                  height: isLargeDesktop ? 50 : isDesktop ? 45 : 40,
                  color: '#222222',
                  borderColor: '#222222',
                  fontSize: isLargeDesktop ? 16 : isDesktop ? 15 : 14,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#333333',
                    bgcolor: 'rgba(34, 34, 34, 0.04)',
                  },
                }}
              >
                Hacer nuevo test
              </Button>
            </Box>
          ) : (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                sx={{
                  width: isLargeDesktop ? 240 : isDesktop ? 220 : 200,
                  height: isLargeDesktop ? 50 : isDesktop ? 45 : 40,
                  marginBottom: 1,
                  bgcolor: '#222222',
                  fontSize: isLargeDesktop ? 18 : isDesktop ? 17 : 16,
                  '&:hover': {
                    bgcolor: '#333333',
                  },
                }}
              >
                {currentLandingItem.buttonText}
              </Button>

              {activeStep === landingData.length - 1 && (
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleSkip}
                  sx={{
                    width: isLargeDesktop ? 240 : isDesktop ? 220 : 200,
                    height: isLargeDesktop ? 50 : isDesktop ? 45 : 40,
                    fontSize: isLargeDesktop ? 18 : isDesktop ? 17 : 16,
                  }}
                >
                  Elegir mis decants
                </Button>
              )}
            </>
          )}

          {activeStep === 1 && (
            <Typography
              component="span"
              onClick={() => setShowDecantPopup(true)}
              sx={{
                color: '#0000EE',
                textDecoration: 'underline',
                fontSize: isLargeDesktop ? 18 : isDesktop ? 17 : 16,
                fontWeight: 500,
                cursor: 'pointer',
                mt: 1,
              }}
            >
              ¿Qué es un decant?
            </Typography>
          )}
        </Box>
      </Box>

      {/* Decant Popup */}
      <DecantPopup
        visible={showDecantPopup}
        onClose={() => setShowDecantPopup(false)}
      />
    </Box>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    marginBottom: 24,
    alignSelf: 'center',
  },
  title: {
    fontFamily: 'InstrumentSans',
    fontWeight: 'bold',
    color: '#222222',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 26,
  },
  description: {
    fontFamily: 'InstrumentSans',
    textAlign: 'center',
    color: '#717171',
    lineHeight: 25,
  },
});

export default LandingScreen;