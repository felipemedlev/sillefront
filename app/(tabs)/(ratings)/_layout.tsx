import { Stack } from 'expo-router';

export default function RatingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FFFEFC' }
      }}
    />
  );
}