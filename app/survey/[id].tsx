import React, { useEffect, useRef, useState } from 'react';
import { View, Dimensions, Text, StyleSheet, TouchableOpacity, Image, Animated, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter, Redirect } from 'expo-router';
import { useSurveyContext } from '../../context/SurveyContext';
import Logo from '../../assets/images/Logo.svg';
import { Ionicons } from '@expo/vector-icons';

type QuestionType = {
  id: string;
  type?: 'gender';
  accord?: string;
  description?: string;
  question?: string;
  options?: {
    id: string;
    label: string;
    emoji: string;
  }[];
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
  { id: '8', accord: 'Lavanda', description: 'Aroma herbal y relajante' },
  { id: '9', accord: 'Frutales', description: 'Aromas jugosos como manzana o berries' },
  { id: '10', accord: 'Acanelados', description: 'Notas especiadas dulces como canela' },
  { id: '11', accord: 'Especiados', description: 'Toques cálidos como clavo de olor o pimienta' },
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
  const { setAnswer, answers, saveAllAnswers } = useSurveyContext();
  const question = surveyQuestions[questionIndex];
  const animatedScales = useRef(emojiRatings.map(() => new Animated.Value(1))).current;
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

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
  }, [fadeAnim, slideAnim]);

  if (!question && questionId !== 'complete') {
    return <Redirect href="/survey/1" />;
  }

  if (!question) return null;

  const handleRate = (rating: number | string) => {
    if (question.type === 'gender') {
      // Handle gender selection
      setAnswer('gender', rating as string);
      const nextQuestionId = parseInt(questionId) + 1;
      if (nextQuestionId <= surveyQuestions.length) {
        router.push({
          pathname: '/survey/[id]',
          params: { id: String(nextQuestionId) },
        });
      } else {
        saveAllAnswers();
        router.push('/survey/complete');
      }
    } else {
      // Handle regular rating
      if (question.accord) {
        setAnswer(question.accord, rating as number);
      }
      const nextQuestionId = parseInt(questionId) + 1;
      if (nextQuestionId <= surveyQuestions.length) {
        router.push({
          pathname: '/survey/[id]',
          params: { id: String(nextQuestionId) },
        });
      } else {
        saveAllAnswers();
        router.push('/survey/complete');
      }
    }
  };

  const handleNoAnswer = () => {
    if (question.accord) {
      setAnswer(question.accord, -1);
    }
    const nextQuestionId = parseInt(questionId) + 1;
    if (nextQuestionId <= surveyQuestions.length) {
      router.push({
        pathname: '/survey/[id]',
        params: { id: String(nextQuestionId) },
      });
    } else {
      saveAllAnswers();
      router.push('/survey/complete');
    }
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
});
