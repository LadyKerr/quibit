import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    if (!session && !inAuthGroup) {
      // Redirect to login if there's no session and we're not in auth group
      router.replace('/login');
    } else if (session && inAuthGroup) {
      // Redirect to home if we have a session but are in auth group
      router.replace('/');
    }
  }, [session, loading, segments]);

  if (loading) {
    return null;
  }

  return <>{children}</>;
}