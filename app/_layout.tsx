import 'react-native-get-random-values';
import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { OnboardingProvider } from '../contexts/OnboardingContext';
import { AuthGuard } from '../components/AuthGuard';

export default function RootLayout() {
  return (
    <AuthProvider>
      <OnboardingProvider>
        <AuthGuard>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </AuthGuard>
      </OnboardingProvider>
    </AuthProvider>
  );
}