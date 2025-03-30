import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useOnboarding } from '../contexts/OnboardingContext';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { session, loading } = useAuth();
  const { hasCompletedOnboarding } = useOnboarding();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';
    
    if (!session && !inAuthGroup) {
      // Redirect to login if there's no session and we're not in auth group
      router.replace('/login');
    } else if (session && inAuthGroup) {
      // If authenticated but in auth group, send to onboarding or tabs
      if (!hasCompletedOnboarding) {
        router.replace('/(onboarding)/welcome');
      } else {
        router.replace('/(tabs)');
      }
    } else if (session && !hasCompletedOnboarding && !inOnboardingGroup) {
      // If authenticated but hasn't completed onboarding, redirect to onboarding
      router.replace('/(onboarding)/welcome');
    } else if (session && hasCompletedOnboarding && inOnboardingGroup) {
      // If authenticated and completed onboarding but in onboarding group, go to tabs
      router.replace('/(tabs)');
    }
  }, [session, loading, segments, hasCompletedOnboarding]);

  if (loading) {
    return null;
  }

  return <>{children}</>;
}