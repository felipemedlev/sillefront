import { Stack } from 'expo-router';
import { SurveyProvider } from '../../context/SurveyContext';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <SurveyProvider>
      <StatusBar style="dark" translucent={true} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: true, title: "Home" }} />
        <Stack.Screen name="[id]" />
      </Stack>
    </SurveyProvider>
  );
}