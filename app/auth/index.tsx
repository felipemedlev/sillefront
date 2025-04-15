import { Redirect } from 'expo-router';

export default function AuthRoute() {
  // Redirect from /auth to /login
  return <Redirect href="/login" />;
}