import React, { useEffect, useRef, useState, useMemo } from 'react'; // Added useMemo
import { View, Dimensions, Text, StyleSheet, TouchableOpacity, Image, Animated, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSurveyContext } from '../../context/SurveyContext';
import { SkeletonSurveyQuestion } from '../../components/ui/SkeletonLoader';
import Logo from '../../assets/images/Logo.svg';
import { Ionicons } from '@expo/vector-icons';
import { shouldUseNativeDriver } from '../../src/utils/animation';

// Type for question (matches backend)
// QuestionType is now implicitly handled by the context

// Add this somewhere near the top of app/survey/[id].tsx,
// perhaps after the imports or before the component definition.
// You need to replace the keys ('Accord1FromApi', 'Accord2FromApi', etc.)
// with the actual string values your API sends for `question.accord`,
// and provide the correct Spanish translation for each.
const accordTranslations: { [key: string]: string } = {
  'floral': 'florales',
  'woody': 'amaderados',
  'citrus': 'cítricos',
  'fruity': 'frutales',
  'spicy': 'especiados',
  'leather': 'acuerados',
  'sweet': 'dulces',
  'vanilla': 'avainillados',
  'smoky': 'ahumados',
  'lavender': 'de lavanda',
  'honey': 'de miel',
  'coffee': 'de café',
  'earthy': 'terrosos',
  'warm spicy': 'especiados cálidos',
  'powdery': 'atalcados',
  'cinnamon': 'acanelados',
};

// Function to get the translation, with a fallback
const getAccordTranslation = (accord?: string): string => {
  if (!accord) return '';
  // Convert API accord to lowercase for case-insensitive matching,
  // assuming your keys in accordTranslations are lowercase.
  // Adjust if your API sends varying cases and you want to handle that.
  const lowerAccord = accord.toLowerCase();
  return accordTranslations[lowerAccord] || accord; // Fallback to original if no translation found
};

// Map images using lowercase accord names as keys
const imageMap: { [key: string]: any } = { // Added type annotation
  'sweet': require('../../assets/images/survey_sweet.png'),
  'citrus': require('../../assets/images/survey_citrus.png'),
  'woody': require('../../assets/images/survey_woody.png'),
  'floral': require('../../assets/images/survey_floral.png'),
  'vanilla': require('../../assets/images/survey_vanilla.png'),
  'smoky': require('../../assets/images/survey_smoky.jpg'),
  'lavender': require('../../assets/images/survey_lavender.png'),
  'fruity': require('../../assets/images/survey_fruity.png'),
  'cinnamon': require('../../assets/images/survey_cinnamon.png'),
  'warm spicy': require('../../assets/images/survey_spicy.png'),
  'leather': require('../../assets/images/survey_leather.jpg'),
  'honey': require('../../assets/images/survey_honey.jpg'),
  'coffee': require('../../assets/images/survey_coffee.jpg'),
  'earthy': require('../../assets/images/survey_earthy.jpg'),
  'powdery': require('../../assets/images/survey_powdery.jpg'),
};

const emojiRatings = ['😖', '😒', '😐', '🙂', '😍'];
const ratingLabels = ['Odio', 'No me gusta', 'Neutral', 'Me gusta', 'Amo'];
const ratingDescriptions = [
  'Evito completamente este aroma',
  'No es para mí, prefiero otros',
  'Está bien, no me molesta',
  'Me gusta bastante este aroma',
  'Me encanta, es perfecto para mí'
];
const screenHeight = Dimensions.get('window').height;
const DESKTOP_BREAKPOINT = 768;

export default function SurveyQuestion() {
  const { id } = useLocalSearchParams();
  const questionId = typeof id === 'string' ? id : '1';
  const router = useRouter();
  const {
    setAnswer,
    answers,
    questions,
    isLoadingQuestions: isLoading,
    questionError: error,
    saveProgress,
  } = useSurveyContext();

  // Removed local useEffect for fetching questions - now handled by context

  // Find current question by ID from route params (more robust than index)
  const question = useMemo(() => {
    if (!isLoading && questions && questionId) {
      // Find the question whose 'id' (which is the DB primary key as a string) matches the route param
      return questions.find(q => q.id === questionId);
    }
    return null;
  }, [isLoading, questions, questionId]); // Depend on questionId directly

  // Calculate the current index based on the found question for styling purposes
  const currentIndex = useMemo(() => {
    if (question && questions) {
      return questions.findIndex(q => q.id === question.id);
    }
    return -1; // Return -1 or some default if not found
  }, [question, questions]);
  const animatedScales = useRef(emojiRatings.map(() => new Animated.Value(1))).current;
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    Animated.parallel([
      Animated.spring(fadeAnim, {
        toValue: 1,
        useNativeDriver: shouldUseNativeDriver,
        tension: 50,
        friction: 7,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: shouldUseNativeDriver,
        tension: 50,
        friction: 7,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // No Redirect needed here anymore. Loading/Error states below handle it.

  // Helper: submit answer to backend after updating local state
  const submitAndNavigate = async (key: string, value: number | string, nextQuestionId: number) => {
    const updatedAnswers = { ...answers, [key]: value };
    // Removed the immediate API call. Submission will happen post-login/signup.
    setAnswer(key, value);
    
    // Save progress
    try {
      await saveProgress(questionId);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
    
    if (nextQuestionId <= questions.length) {
      router.push({
        pathname: '/survey/[id]',
        params: { id: String(nextQuestionId) },
      });
    } else {
      router.push('/survey/complete');
    }
  };

  const handleRate = (rating: number | string) => {
    if (!question) return;
    const nextQuestionId = parseInt(questionId) + 1;
    if (question.type === 'gender') {
      submitAndNavigate('gender', rating as string, nextQuestionId);
    } else if (question.accord) {
      submitAndNavigate(question.accord, rating as number, nextQuestionId);
    }
  };

  const handleNoAnswer = () => {
    if (!question || !question.accord) return;
    const nextQuestionId = parseInt(questionId) + 1;
    submitAndNavigate(question.accord, -1, nextQuestionId);
  };

  const handlePressIn = (index: number) => {
    setHoveredRating(index);
    Animated.spring(animatedScales[index], {
      toValue: 1.2,
      useNativeDriver: true,
      tension: 200,
      friction: 3,
    }).start();
  };

  const handlePressOut = (index: number) => {
    setHoveredRating(null);
    Animated.spring(animatedScales[index], {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
      friction: 3,
    }).start();
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SkeletonSurveyQuestion />
      </View>
    );
  }
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }

  if (!isLoading && !error && !question) {
    console.warn(`Survey question with ID ${questionId} not found after loading.`);
    return null;
  }

  if (!question) {
      return null;
  }


  return (
    // Main container View with dynamic background
    <View style={[styles.container, currentIndex >= 0 ? { backgroundColor: `#F${currentIndex % 10}EECF` } : { backgroundColor: '#FFFFFF' }]}>

      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            // Navigation logic for back button
            const currentIdx = questions.findIndex(q => q.id === questionId);
            if (currentIdx > 0) {
              const prevQuestionId = questions[currentIdx - 1].id;
              router.back();
            } else {
              router.replace('/'); // Navigate to landing page
            }
          }}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={32} color="#000000" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Logo width={isDesktop ? 160 : 120} height={isDesktop ? 48 : 36} preserveAspectRatio="xMidYMid meet" />
        </View>
      </View>

      {/* Conditional Rendering: Only render content if 'question' is loaded */}
      {question ? (
        <>
          {/* Image Section (Only for non-gender questions) */}
          {question.type !== 'gender' ? (
            <View style={styles.imageContainer}>
              <View style={styles.imageWrapper}>
                {question.accord && imageMap[question.accord.toLowerCase()] ? (
                  <Image
                    source={imageMap[question.accord.toLowerCase()]}
                    style={styles.image}
                    resizeMode="contain"
                  />
                ) : null}
              </View>
            </View>
          ) : null}

          {/* Animated Content Section (Text, Options/Ratings) */}
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

            {/* Question Text */}
            {question.type === 'gender' ? (
              <Text style={[styles.questionGender, isDesktop && styles.desktopQuestionGender]}>
                {question.question || '¿Qué tipo de fragancias buscas?'}
              </Text>
            ) : (
              <Text style={[styles.question, isDesktop && styles.desktopQuestion]}>
                Te gustan los aromas {getAccordTranslation(question.accord) || ''}?
              </Text>
            )}

            {/* Description (Only for non-gender questions) */}
            {question.type !== 'gender' && question.description ? (
              <Text style={styles.description}>{question.description}</Text>
            ) : null}

            {/* Options Area */}
            {question.type === 'gender' ? (
              // Gender Options
              <View style={[styles.genderContainer, isDesktop && styles.desktopGenderContainer]}>
                {question.options?.map((option) => (
                  <View key={option.id} style={[styles.optionContainer, isDesktop && styles.desktopOptionContainer]}>
                    <TouchableOpacity
                      style={[
                        styles.genderButton,
                        isDesktop && styles.desktopGenderButton,
                        answers['gender'] === option.id ? styles.selectedGender : null,
                      ].filter(Boolean)}
                      onPress={() => handleRate(option.id)}
                    >
                      <Text style={[styles.genderEmoji, isDesktop && styles.desktopGenderEmoji]}>{option.emoji}</Text>
                    </TouchableOpacity>
                    <Text style={[styles.genderLabel, isDesktop && styles.desktopGenderLabel]}>{option.label}</Text>
                  </View>
                ))}
              </View>
            ) : (
              // Accord Rating Options
              <>
                <View style={[styles.ratingContainer, isDesktop && styles.desktopRatingContainer]}>
                  {emojiRatings.map((emoji, index) => (
                    <Animated.View
                      key={index}
                      style={{ transform: [{ scale: animatedScales[index] }] }}
                    >
                      <TouchableOpacity
                        style={[
                          styles.ratingButton,
                          isDesktop && styles.desktopRatingButton,
                          question.accord && answers[question.accord] === index + 1 ? styles.selectedRating : null,
                        ].filter(Boolean)}
                        onPress={() => handleRate(index + 1)}
                        onPressIn={() => handlePressIn(index)}
                        onPressOut={() => handlePressOut(index)}
                      >
                        <Text style={[styles.ratingText, isDesktop && styles.desktopRatingText]}>{emoji || '🙂'}</Text>
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </View>
                
                {/* Rating Labels */}
                <View style={styles.ratingLabelsContainer}>
                  <View style={styles.ratingScaleContainer}>
                    <Text style={styles.scaleLabel}>{ratingLabels[0] || 'Odio'}</Text>
                    <View style={styles.scaleLine} />
                    <Text style={styles.scaleLabel}>{ratingLabels[4] || 'Amo'}</Text>
                  </View>
                  
                  {/* Dynamic rating feedback */}
                  <View style={styles.ratingFeedbackContainer}>
                    {hoveredRating !== null && ratingLabels[hoveredRating] && ratingDescriptions[hoveredRating] ? (
                      <Text style={styles.ratingFeedbackText}>
                        {ratingLabels[hoveredRating]}: {ratingDescriptions[hoveredRating]}
                      </Text>
                    ) : (
                      <Text style={styles.ratingPromptText}>
                        Toca un emoji para valorar este aroma
                      </Text>
                    )}
                  </View>
                </View>
              </>
            )}
            {question.type !== 'gender' ? (
              <TouchableOpacity
                style={[styles.noAnswerButton, isDesktop && styles.desktopNoAnswerButton]}
                onPress={handleNoAnswer}
              >
                <Text style={[styles.noAnswerText, isDesktop && styles.desktopNoAnswerText]}>🙄 No sé</Text>
              </TouchableOpacity>
            ) : null}

          </Animated.View>
        </>
      ) : (
        null
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    position: 'relative',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: 8,
    zIndex: 1,
    borderRadius: 50,
    backgroundColor: 'transparent',
  },
  logoContainer: {
    width: '100%',
    alignItems: 'center',
  },
  imageContainer: {
    marginTop: 40,
    alignItems: 'center',
    width: '100%',
  },
  imageWrapper: {
    width: screenHeight * 0.28,
    height: screenHeight * 0.28,
    borderRadius: screenHeight * 0.14,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  image: {
    width: '90%',
    height: '90%',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 600,
  },
  question: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
    color: '#222222',
    lineHeight: 32,
  },
  desktopQuestion: {
    fontSize: 32,
    marginBottom: 10,
    lineHeight: 40,
  },
  questionGender: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: '10%',
    color: '#222222',
    lineHeight: 36,
  },
  desktopQuestionGender: {
    fontSize: 32,
    marginTop: '10%',
    lineHeight: 40,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#717171',
    lineHeight: 24,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
    width: '100%',
    maxWidth: 400,
  },
  desktopRatingContainer: {
    gap: 24,
    maxWidth: 500,
  },
  ratingButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  desktopRatingButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  selectedRating: {
    backgroundColor: '#8E44AD',
    borderColor: '#6C3483',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    boxShadow: '0 2px 4px rgba(108, 52, 131, 0.2)',
  },
  ratingText: {
    fontSize: 32,
  },
  desktopRatingText: {
    fontSize: 32,
  },
  noAnswerButton: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F7F7F7',
  },
  desktopNoAnswerButton: {
    marginTop: 20,
    padding: 16,
  },
  noAnswerText: {
    fontSize: 16,
    color: '#717171',
    fontWeight: '500',
  },
  desktopNoAnswerText: {
    fontSize: 18,
  },
  genderContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: '10%',
    maxWidth: 500,
  },
  desktopGenderContainer: {
    gap: 40,
    maxWidth: 600,
  },
  optionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  desktopOptionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  genderButton: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  desktopGenderButton: {
    width: 120,
    height: 120,
    borderRadius: 24,
  },
  selectedGender: {
    backgroundColor: '#8E44AD',
    borderColor: '#6C3483',
    boxShadow: '0px 2px 4px rgba(108, 52, 131, 0.2)',
  },
  genderEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  desktopGenderEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  genderLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
  },
  desktopGenderLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222222',
  },
  ratingLabelsContainer: {
    width: '100%',
    marginTop: 20,
    alignItems: 'center',
  },
  ratingScaleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    width: '80%',
  },
  scaleLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  scaleLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 12,
  },
  ratingFeedbackContainer: {
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(128, 156, 172, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '90%',
  },
  ratingFeedbackText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
  },
  ratingPromptText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
