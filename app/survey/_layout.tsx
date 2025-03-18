import { Stack } from 'expo-router';
import { SurveyProvider } from '../../context/SurveyContext';

export default function RootLayout() {
  return (
    <SurveyProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: true, title: "Home" }} />
        <Stack.Screen name="survey/[id]" />
      </Stack>
    </SurveyProvider>
  );
}