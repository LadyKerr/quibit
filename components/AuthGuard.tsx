import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useOnboarding } from '../contexts/OnboardingContext';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { session, loading, signOut } = useAuth();
  const { hasCompletedOnboarding } = useOnboarding();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';
    const isPasswordReset = segments[1] === 'reset-password' || segments[1] === 'reset-confirm';

    if (!session && !inAuthGroup) {
      // Redirect to login if there's no session
      router.replace('/login');
    } else if (session) {
      if (inAuthGroup && !isPasswordReset) {
        // After successful login, check onboarding status
        if (!hasCompletedOnboarding) {
          router.replace('/(onboarding)/welcome');
        } else {
          router.replace('/(tabs)');
        }
      } else if (!hasCompletedOnboarding && !inOnboardingGroup && !isPasswordReset) {
        // Ensure users complete onboarding
        router.replace('/(onboarding)/welcome');
      }
    }
  }, [session, loading, segments, hasCompletedOnboarding]);

  useEffect(() => {
    if (session?.expires_at) {
      const expiresAt = new Date(session.expires_at * 1000);
      if (expiresAt < new Date()) {
        signOut();
      }
    }
  }, [session]);

  if (loading) {
    return null;
  }

  return <>{children}</>;
}