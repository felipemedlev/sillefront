// app/_layout.tsx
import { Stack } from 'expo-router';
import { SurveyProvider } from '../../context/SurveyContext';

export default function RootLayout() {
  return (
    <SurveyProvider>
      <Stack />
    </SurveyProvider>
  );
}
