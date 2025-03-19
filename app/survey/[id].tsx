import React, { useEffect, useMemo, useRef } from 'react';
import { View, Dimensions, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
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
  { id: '2', accord: 'Dulces', description: 'Fresh, zesty scents like lemon, orange, and grapefruit' },
  { id: '3', accord: 'Cítricos', description: 'Scents of various flowers like rose, jasmine, and lily' },
  { id: '4', accord: 'Amaderados', description: 'Sweet, juicy scents like apple, peach, and berry' },
  { id: '5', accord: 'Florales', description: 'Fresh, natural scents like grass, leaves, and stems' },
  { id: '6', accord: 'Avainillados', description: 'Warm, earthy scents like sandalwood, cedar, and pine' },
  { id: '7', accord: 'Tabaco', description: 'Rich, warm scents like vanilla, amber, and musk' },
  { id: '8', accord: 'Lavanda', description: 'Warm, pungent scents like cinnamon, clove, and pepper' },
  { id: '9', accord: 'Frutales', description: 'Fresh, clean scents reminiscent of the ocean or rainfall' },
  { id: '10', accord: 'Acanelados', description: 'Sweet, edible scents like chocolate, caramel, and coffee' },
  { id: '11', accord: 'Especiados', description: 'Rich, warm scents reminiscent of leather goods' },
  { id: '12', accord: 'Acuerados', description: 'Soft, comforting scents like talcum powder and iris' },
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

export default function SurveyQuestion() {
  const { id } = useLocalSearchParams();
  const questionId = typeof id === 'string' ? id : '1';
  const questionIndex = parseInt(questionId) - 1;
  const router = useRouter();
  const { setAnswer, answers } = useSurveyContext();
  const question = surveyQuestions[questionIndex];
  const animatedScales = useRef(emojiRatings.map(() => new Animated.Value(1))).current;

  // Redirect if question not found
  useEffect(() => {
    if (!question && questionId !== 'complete') {
      router.replace('/survey/1');
    }
  }, [question, questionId, router]);

  if (!question) return null;

  useEffect(() => {
    if (!question) {
      router.replace('/survey/1');
    }
  }, [question, router]);

  if (!question) return null;

  const handleRate = (rating: number | string) => {
    if (question.type === 'gender') {
      // Handle gender selection
      setAnswer('gender', rating as string);
      const nextQuestionId = parseInt(questionId) + 1;
      router.push(nextQuestionId <= surveyQuestions.length ? `/survey/${nextQuestionId}` : '/survey/complete');
    } else {
      // Handle regular rating
      const index = (rating as number) - 1;
      Animated.sequence([
        Animated.spring(animatedScales[index], {
          toValue: 0.8,
          useNativeDriver: true,
          tension: 200,
          friction: 10,
        }),
        Animated.spring(animatedScales[index], {
          toValue: 1,
          useNativeDriver: true,
          tension: 200,
          friction: 10,
        }),
      ]).start(() => {
        if (question.accord) {
          setAnswer(question.accord, rating as number);
        }
        const nextQuestionId = parseInt(questionId) + 1;
        router.push(nextQuestionId <= surveyQuestions.length ? `/survey/${nextQuestionId}` : '/survey/complete');
      });
    }
  };

  const handleNoAnswer = () => {
    setAnswer(question.accord, -1); // Assigning a default 'no answer' value
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={32} color="#000000" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Logo width={100} height="auto" preserveAspectRatio="xMidYMid meet" />
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
      <Text style={styles.question}>
        {question.type === 'gender'
          ? (question.question || '¿Qué tipo de fragancias buscas?')
          : `Te gustan los aromas ${question.accord?.toLowerCase() || ''}?`}
      </Text>
      {question.type !== 'gender' && question.description && (
        <Text style={styles.description}>{question.description}</Text>
      )}

      {/* Gender Selection or Emoji Ratings */}
      {question.type === 'gender' ? (
        <View style={styles.genderContainer}>
          {question.options?.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.genderButton,
                answers['gender'] === option.id && styles.selectedGender
              ]}
              onPress={() => handleRate(option.id)}
            >
              <Text style={styles.genderEmoji}>{option.emoji}</Text>
              <Text style={styles.genderLabel}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.ratingContainer}>
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
                ]}
                onPress={() => handleRate(index + 1)}
                onPressIn={() => handlePressIn(index)}
                onPressOut={() => handlePressOut(index)}
              >
                <Text style={styles.ratingText}>{emoji}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      )}

      {/* "No sé" option */}
      {question.type !== 'gender' && (
        <TouchableOpacity style={styles.noAnswerButton} onPress={handleNoAnswer}>
          <Text style={styles.noAnswerText}>🙄 No sé</Text>
        </TouchableOpacity>
      )}
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
  question: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
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
  selectedRating: {
    backgroundColor: '#8E44AD',
    borderColor: '#6C3483',
  },
  ratingText: {
    fontSize: 32,
  },
  noAnswerButton: {
    marginTop: 10,
    padding: 10,
  },
  noAnswerText: {
    fontSize: 24,
    color: '#888',
  },
  genderContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 20,
  },
  genderButton: {
    width: 100,
    height: 100,
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
  genderLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
});
