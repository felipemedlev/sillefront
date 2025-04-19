import React, { useState } from 'react';
import { Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
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

// Import SVG Assets
import Logo from '../../assets/images/Logo.svg';
import FondoFinal from '../../assets/images/FondoFinal.svg';
import Landing1 from '../../assets/images/landing1.svg';
import Landing2 from '../../assets/images/landing2.svg';
import Landing3 from '../../assets/images/landing3.svg';
import DecantPopup from '../../components/landing/DecantPopup';

const { width, height } = Dimensions.get('window');
const DESKTOP_BREAKPOINT = 768;

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
  const theme = useTheme();
  const isDesktop = Platform.OS === 'web' && width >= DESKTOP_BREAKPOINT;
  const [activeStep, setActiveStep] = useState(0);
  const [showDecantPopup, setShowDecantPopup] = useState(false);
  const logoWidth = isDesktop ? width * 0.15 : width * 0.25;
  const svgHeight = isDesktop ? '25%' : '18%';

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
        <Logo
          width={logoWidth}
          height="auto"
          preserveAspectRatio="xMidYMid meet"
        />
        <Typography
          sx={{
            fontFamily: 'InstrumentSerifItalic',
            fontSize: 22,
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
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        mt: 0,
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}>
        {/* Desktop stepper (horizontal) */}
        {isDesktop && (
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{
              width: '80%',
              mb: 0,
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
          mb: 0,
        }}>
          <ImageComponent
            width={width * 0.9}
            height={height * 0.3}
            preserveAspectRatio="xMidYMid meet"
          />
        </Box>

        {/* Content text */}
        <Paper
          elevation={0}
          sx={{
            width: isDesktop ? '80%' : '90%',
            bgcolor: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontFamily: 'InstrumentSans',
              fontWeight: 'bold',
              fontSize: 22,
              color: '#222222',
              textAlign: 'center',
              mb: 2,
              lineHeight: 1.2,
            }}
          >
            {currentLandingItem.title}
          </Typography>

          {activeStep === 1 ? (
            renderDecantText(currentLandingItem.description)
          ) : (
            <Typography
              variant="body1"
              sx={{
                fontFamily: 'InstrumentSans',
                fontSize: 18,
                textAlign: 'center',
                color: '#717171',
                minHeight: 60,
                lineHeight: 1.4,
              }}
            >
              {currentLandingItem.description}
            </Typography>
          )}
        </Paper>

        {/* Action buttons */}
        <Box sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: 'auto',
          mb: isDesktop ? 5 : 3,
        }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            sx={{
              width: 200,
              marginBottom: '10px',
              bgcolor: '#222222',
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
                width: 200,
              }}
            >
              Elegir mis decants
            </Button>
          )}

          {activeStep === 1 && (
            <Typography
              component="span"
              onClick={() => setShowDecantPopup(true)}
              sx={{
                color: '#0000EE',
                textDecoration: 'underline',
                fontSize: 16,
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

export default LandingScreen;