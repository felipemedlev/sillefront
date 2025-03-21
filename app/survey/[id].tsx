import React, { useEffect, useRef, useState } from 'react';
import { View, Dimensions, Text, StyleSheet, TouchableOpacity, Image, Animated, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSurveyContext } from '../../context/SurveyContext';
import Logo from '../../assets/images/Logo.svg';
import { Ionicons } from '@expo/vector-icons';

type QuestionType = {
  id: string;
  type?: 'gender';
  accord?: string;
  description?: string;
  question?: string;
  options?: Array<{
    id: string;
    label: string;
    emoji: string;
  }>;
};

const surveyQuestions: QuestionType[] = [
  {
    id: '1',
    type: 'gender',
    question: '¿Qué tipo de fragancias buscas?',
    options: [
      { id: 'male', label: 'Masculinas', emoji: '👨' },
      { id: 'unisex', label: 'Unisex', emoji: '👥' },
      { id: 'female', label: 'Femeninas', emoji: '👩' },
    ]
  },
  { id: '2', accord: 'Dulces', description: 'Aromas comestibles como chocolate o caramelo' },
  { id: '3', accord: 'Cítricos', description: 'Notas frescas como limón o naranja' },
  { id: '4', accord: 'Amaderados', description: 'Aromas cálidos como cedro o sándalo' },
  { id: '5', accord: 'Florales', description: 'Esencias de flores como rosa o jazmín' },
  { id: '6', accord: 'Avainillados', description: 'Toques dulces y cálidos de vainilla' },
  { id: '7', accord: 'Tabaco', description: 'Aromas intensos y cálidos como el tabaco' },
  { id: '8', accord: 'Lavanda', description: 'Aroma herbal fresco y relajante' },
  { id: '9', accord: 'Frutales', description: 'Aromas jugosos como manzana o durazno' },
  { id: '10', accord: 'Acanelados', description: 'Notas especiadas dulces como canela' },
  { id: '11', accord: 'Especiados', description: 'Toques cálidos como clavo o pimienta' },
  { id: '12', accord: 'Acuerados', description: 'Aromas intensos tipo cuero' },
];

const imageMap = {
  2: require('../../assets/images/survey1.png'),
  3: require('../../assets/images/survey2.png'),
  4: require('../../assets/images/survey3.png'),
  5: require('../../assets/images/survey4.png'),
  6: require('../../assets/images/survey5.png'),
  7: require('../../assets/images/survey6.png'),
  8: require('../../assets/images/survey7.png'),
  9: require('../../assets/images/survey8.png'),
  10: require('../../assets/images/survey9.png'),
  11: require('../../assets/images/survey10.png'),
  12: require('../../assets/images/survey11.png'),
};

const emojiRatings = ['😖', '😒', '😐', '🙂', '😍'];
const screenHeight = Dimensions.get('window').height;
const DESKTOP_BREAKPOINT = 768;

export default function SurveyQuestion() {
  const { id } = useLocalSearchParams();
  const questionId = typeof id === 'string' ? id : '1';
  const questionIndex = parseInt(questionId) - 1;
  const router = useRouter();
  const { setAnswer, answers } = useSurveyContext();
  const question = surveyQuestions[questionIndex];
  const animatedScales = useRef(emojiRatings.map(() => new Animated.Value(1))).current;
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Redirect if question not found
  useEffect(() => {
    if (!question && questionId !== 'complete') {
      router.replace('/survey/1');
    }
  }, [question, questionId, router]);

  useEffect(() => {
    if (!question) {
      router.replace('/survey/1');
    }
  }, [question, router]);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(fadeAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
    ]).start();
  }, []);

  if (!question) return null;

  const handleRate = (rating: number | string) => {
    if (question.type === 'gender') {
      // Handle gender selection
      setAnswer('gender', rating as string);
      const nextQuestionId = parseInt(questionId) + 1;
      router.push(nextQuestionId <= surveyQuestions.length ? `/survey/${nextQuestionId}` : '/survey/complete');
    } else {
      // Handle regular rating
      if (question.accord) {
        setAnswer(question.accord, rating as number);
      }
      const nextQuestionId = parseInt(questionId) + 1;
      router.push(nextQuestionId <= surveyQuestions.length ? `/survey/${nextQuestionId}` : '/survey/complete');
    }
  };

  const handleNoAnswer = () => {
    if (question.accord) {
      setAnswer(question.accord, -1);
    }
    const nextQuestionId = parseInt(questionId) + 1;
    router.push(nextQuestionId <= surveyQuestions.length ? `/survey/${nextQuestionId}` : '/survey/complete');
  };

  const handlePressIn = (index: number) => {
    // Implement the logic for pressing in
  };

  const handlePressOut = (index: number) => {
    // Implement the logic for pressing out
  };

  return (
    <View style={[styles.container, { backgroundColor: `#F${questionIndex}EECF` }]}>
      {/* Header with Logo and Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            const currentId = typeof questionId === 'string' ? parseInt(questionId) : 1;
            if (currentId > 1) {
              router.push(`/survey/${currentId - 1}`);
            } else {
              router.push('/landing');
            }
          }}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={32} color="#000000" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Logo width={isDesktop ? 160 : 120} height="auto" preserveAspectRatio="xMidYMid meet" />
        </View>
      </View>

      {/* Accord Image */}
      {question.type !== 'gender' && (
        <View style={styles.imageContainer}>
          <View style={styles.imageWrapper}>
            <Image
              source={imageMap[parseInt(questionId, 10) as keyof typeof imageMap]}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        </View>
      )}

      {/* Question */}
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {question.type === 'gender' ? (
          <Text style={[styles.questionGender, isDesktop && styles.desktopQuestionGender]}>
            {question.question || '¿Qué tipo de fragancias buscas?'}
          </Text>
        ) : (
          <Text style={[styles.question, isDesktop && styles.desktopQuestion]}>
            {`Te gustan los aromas ${question.accord?.toLowerCase() || ''}?`}
          </Text>
        )}

        {/* Description (only for non-gender questions) */}
        {question.type !== 'gender' && question.description && (
          <Text style={styles.description}>{question.description}</Text>
        )}

        {/* Gender Selection or Emoji Ratings */}
        {question.type === 'gender' ? (
          <View style={[styles.genderContainer, isDesktop && styles.desktopGenderContainer]}>
            {question.options?.map((option) => (
              <View key={option.id} style={[styles.optionContainer, isDesktop && styles.desktopOptionContainer]}>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    answers['gender'] === option.id && styles.selectedGender,
                    isDesktop && styles.desktopGenderButton
                  ]}
                  onPress={() => handleRate(option.id)}
                >
                  <Text style={[styles.genderEmoji, isDesktop && styles.desktopGenderEmoji]}>{option.emoji}</Text>
                </TouchableOpacity>
                <Text style={[styles.genderLabel, isDesktop && styles.desktopGenderLabel]}>{option.label}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.ratingContainer, isDesktop && styles.desktopRatingContainer]}>
            {emojiRatings.map((emoji, index) => (
              <Animated.View
                key={index}
                style={{
                  transform: [{ scale: animatedScales[index] }],
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.ratingButton,
                    question.accord && answers[question.accord] === index + 1 && styles.selectedRating,
                    isDesktop && styles.desktopRatingButton
                  ]}
                  onPress={() => handleRate(index + 1)}
                  onPressIn={() => handlePressIn(index)}
                  onPressOut={() => handlePressOut(index)}
                >
                  <Text style={[styles.ratingText, isDesktop && styles.desktopRatingText]}>{emoji}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        )}

        {/* "No sé" option */}
        {question.type !== 'gender' && (
          <TouchableOpacity
            style={[styles.noAnswerButton, isDesktop && styles.desktopNoAnswerButton]}
            onPress={handleNoAnswer}
          >
            <Text style={[styles.noAnswerText, isDesktop && styles.desktopNoAnswerText]}>🙄 No sé</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    position: 'relative',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: 10,
    zIndex: 1,
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
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: '70%',
    height: '70%',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  question: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  desktopQuestion: {
    fontSize: 32,
    marginBottom: 10,
  },
  questionGender: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: '10%',
  },
  desktopQuestionGender: {
    fontSize: 32,
    marginTop: '10%',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 13,
    marginBottom: 20,
  },
  desktopRatingContainer: {
    gap: 20,
  },
  ratingButton: {
    width: 20,
    height: 20,
    padding: 30,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  desktopRatingButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  selectedRating: {
    backgroundColor: '#8E44AD',
    borderColor: '#6C3483',
  },
  ratingText: {
    fontSize: 32,
  },
  desktopRatingText: {
    fontSize: 32,
  },
  noAnswerButton: {
    marginTop: 10,
    padding: 10,
  },
  desktopNoAnswerButton: {
    marginTop: 10,
    padding: 10,
  },
  noAnswerText: {
    fontSize: 24,
    color: '#888',
  },
  desktopNoAnswerText: {
    fontSize: 24,
    color: '#888',
  },
  genderContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: '10%',
  },
  desktopGenderContainer: {
    gap: 40,
  },
  optionContainer: {
    alignItems: 'center',  // Centers items (emoji & text) horizontally
    justifyContent: 'center', // Ensures proper alignment
    gap: 10,
    marginVertical: 10,  // Adds spacing between options
  },
  desktopOptionContainer: {
    alignItems: 'center',  // Centers items (emoji & text) horizontally
    justifyContent: 'center', // Ensures proper alignment
    gap: 10,
    marginVertical: 10,  // Adds spacing between options
  },
  genderButton: {
    width: 80,
    height: 80,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  desktopGenderButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  selectedGender: {
    backgroundColor: '#8E44AD',
    borderColor: '#6C3483',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  genderEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  desktopGenderEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  genderLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  desktopGenderLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
});
