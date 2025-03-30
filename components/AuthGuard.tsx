import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      // Redirect to login if there's no session
      if (!session) {
        router.replace('/login');
      }
    }
  }, [session, loading]);

  // Show nothing while loading
  if (loading) {
    return null;
  }

  return <>{children}</>;
}