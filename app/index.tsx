import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to landing page
  return <Redirect href="/landing" />;
}
