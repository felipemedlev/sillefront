import React, { useEffect, useMemo, useRef } from 'react';
import { View, Dimensions, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSurveyContext } from '../../context/SurveyContext';
import Logo from '../../assets/images/Logo.svg';
import { Ionicons } from '@expo/vector-icons';

// Survey questions data
const surveyQuestions = [
  { id: '1', accord: 'Dulces', description: 'Fresh, zesty scents like lemon, orange, and grapefruit' },
  { id: '2', accord: 'Cítricos', description: 'Scents of various flowers like rose, jasmine, and lily' },
  { id: '3', accord: 'Amaderados', description: 'Sweet, juicy scents like apple, peach, and berry' },
  { id: '4', accord: 'Florales', description: 'Fresh, natural scents like grass, leaves, and stems' },
  { id: '5', accord: 'Avainillados', description: 'Warm, earthy scents like sandalwood, cedar, and pine' },
  { id: '6', accord: 'Tabaco', description: 'Rich, warm scents like vanilla, amber, and musk' },
  { id: '7', accord: 'Lavanda', description: 'Warm, pungent scents like cinnamon, clove, and pepper' },
  { id: '8', accord: 'Frutales', description: 'Fresh, clean scents reminiscent of the ocean or rainfall' },
  { id: '9', accord: 'Acanelados', description: 'Sweet, edible scents like chocolate, caramel, and coffee' },
  { id: '10', accord: 'Especiados', description: 'Rich, warm scents reminiscent of leather goods' },
  { id: '11', accord: 'Acuerados', description: 'Soft, comforting scents like talcum powder and iris' },
];

const imageMap = {
  1: require('../../assets/images/survey1.png'),
  2: require('../../assets/images/survey2.png'),
  3: require('../../assets/images/survey3.png'),
  4: require('../../assets/images/survey4.png'),
  5: require('../../assets/images/survey5.png'),
  6: require('../../assets/images/survey6.png'),
  7: require('../../assets/images/survey7.png'),
  8: require('../../assets/images/survey8.png'),
  9: require('../../assets/images/survey9.png'),
  10: require('../../assets/images/survey10.png'),
  11: require('../../assets/images/survey11.png'),
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
  const animatedScale = useRef(new Animated.Value(1)).current;

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

  const handleRate = (rating: number) => {
    Animated.sequence([
      Animated.timing(animatedScale, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.timing(animatedScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(() => {
      setAnswer(question.accord, rating);
      const nextQuestionId = parseInt(questionId) + 1;
      router.push(nextQuestionId <= surveyQuestions.length ? `/survey/${nextQuestionId}` : '/survey/complete');
    });
  };

  const handleNoAnswer = () => {
    setAnswer(question.accord, -1); // Assigning a default 'no answer' value
    const nextQuestionId = parseInt(questionId) + 1;
    router.push(nextQuestionId <= surveyQuestions.length ? `/survey/${nextQuestionId}` : '/survey/complete');
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
      <View style={styles.imageContainer}>
        <View style={styles.imageWrapper}>
          <Image
            source={imageMap[parseInt(questionId, 10) as keyof typeof imageMap]}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Question */}
      <Text style={styles.question}>Te gustan los aromas {question.accord.toLowerCase()}?</Text>
      <Text style={styles.description}>{question.description}</Text>

      {/* Emoji Ratings */}
      <View style={styles.ratingContainer}>
        {emojiRatings.map((emoji, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.ratingButton, answers[question.accord] === index + 1 && styles.selectedRating]}
            onPress={() => handleRate(index + 1)}
          >
            <Text style={styles.ratingText}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* "No sé" option */}
      <TouchableOpacity style={styles.noAnswerButton} onPress={handleNoAnswer}>
        <Text style={styles.noAnswerText}>🙄 No sé</Text>
      </TouchableOpacity>
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
    position: 'relative', // Add this to ensure proper positioning context
  },
  backButton: {
    // Remove position: 'absolute'
    padding: 0, // Add padding to increase the touchable area
    zIndex: 1, // Ensure it's above other elements
    left: 0, // Keep it on the left side
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center', // Centers the logo horizontally
  },
  imageContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  imageWrapper: {
    width: screenHeight * 0.2, // 20% of screen height
    height: screenHeight * 0.2,
    borderRadius: screenHeight * 0.1, // Keep it circular
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '90%',  // Fit inside wrapper
    height: '90%', // Scale proportionally
  },
  accordImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
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
});
