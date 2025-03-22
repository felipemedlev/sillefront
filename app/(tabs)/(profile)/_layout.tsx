import { Stack } from 'expo-router';
import { SurveyProvider } from '../../../context/SurveyContext';

export default function ProfileLayout() {
  return (
    <SurveyProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FFFEFC' }
        }}
      />
    </SurveyProvider>
  );
}