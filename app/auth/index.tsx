import { useRouter } from 'expo-router';

export default function AuthIndex() {
  const router = useRouter();
  router.replace('/auth/signup');
  return null;
}