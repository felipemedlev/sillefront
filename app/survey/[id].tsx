import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSurveyContext } from '../../context/SurveyContext';

// Survey questions data
const surveyQuestions = [
  { id: '1', accord: 'Citrus', description: 'Fresh, zesty scents like lemon, orange, and grapefruit' },
  { id: '2', accord: 'Floral', description: 'Scents of various flowers like rose, jasmine, and lily' },
  { id: '3', accord: 'Fruity', description: 'Sweet, juicy scents like apple, peach, and berry' },
  { id: '4', accord: 'Green', description: 'Fresh, natural scents like grass, leaves, and stems' },
  { id: '5', accord: 'Woody', description: 'Warm, earthy scents like sandalwood, cedar, and pine' },
  { id: '6', accord: 'Oriental', description: 'Rich, warm scents like vanilla, amber, and musk' },
  { id: '7', accord: 'Spicy', description: 'Warm, pungent scents like cinnamon, clove, and pepper' },
  { id: '8', accord: 'Aquatic', description: 'Fresh, clean scents reminiscent of the ocean or rainfall' },
  { id: '9', accord: 'Gourmand', description: 'Sweet, edible scents like chocolate, caramel, and coffee' },
  { id: '10', accord: 'Leather', description: 'Rich, warm scents reminiscent of leather goods' },
  { id: '11', accord: 'Powdery', description: 'Soft, comforting scents like talcum powder and iris' },
  { id: '12', accord: 'Animalic', description: 'Rich, musky scents derived from animal sources or synthetics' },
];

export default function SurveyQuestion() {
  const { id } = useLocalSearchParams();
  const questionId = typeof id === 'string' ? id : '1';
  const questionIndex = parseInt(questionId) - 1;
  const router = useRouter();
  const { setAnswer, answers } = useSurveyContext(); // Use the context hook

  const question = surveyQuestions[questionIndex];

  // Redirect if question not found
  useEffect(() => {
    if (!question && questionId !== 'complete') {
      router.replace('/survey/1');
    }
  }, [question, questionId, router]);

  if (!question) return null;

  const handleRate = (rating: number) => {
    setAnswer(question.accord, rating);
  
    // Navigate to next question or completion screen
    const nextQuestionId = parseInt(questionId) + 1;
    if (nextQuestionId <= surveyQuestions.length) {
      router.push(`/survey/${nextQuestionId}`);
    } else {
      router.push('/survey/complete');
    }
  };

  // Current rating if already answered
  const currentRating = answers[question.accord] || 0;

  return (
    <View style={styles.container}>
      <Text style={styles.questionNumber}>Question {questionId} of {surveyQuestions.length}</Text>
      <Text style={styles.question}>How much do you like {question.accord.toLowerCase()} scents?</Text>
      <Text style={styles.description}>{question.description}</Text>

      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <TouchableOpacity
            key={rating}
            style={[
              styles.ratingButton,
              currentRating === rating && styles.selectedRating,
            ]}
            onPress={() => handleRate(rating)}
            activeOpacity={0.7} // Better button feedback
          >
            <Text style={[styles.ratingText, currentRating === rating && styles.selectedRatingText]}>
              {rating}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.labelContainer}>
        <Text style={styles.ratingLabel}>Dislike</Text>
        <Text style={styles.ratingLabel}>Love</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  questionNumber: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  question: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#444',
    marginBottom: 40,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ratingButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  selectedRating: {
    borderColor: '#6200ee',
    backgroundColor: '#ede7f6',
  },
  ratingText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  selectedRatingText: {
    color: '#6200EE',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#666',
  },
});
