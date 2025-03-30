import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const ONBOARDING_COMPLETE_KEY = '@quibit/onboarding_complete';
const DEFAULT_CATEGORIES = ['Blog', 'Tutorial', 'Video', 'Article', 'Other'];

type OnboardingContextData = {
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => Promise<void>;
  saveCategories: (categories: string[]) => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextData>({} as OnboardingContextData);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const { session } = useAuth();

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const status = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
      setHasCompletedOnboarding(!!status);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const saveCategories = async (categories: string[]) => {
    if (!session?.user?.id) return;

    try {
      // Filter out default categories
      const customCategories = categories.filter(cat => !DEFAULT_CATEGORIES.includes(cat));
      
      if (customCategories.length > 0) {
        const categoriesToInsert = customCategories.map(name => ({
          name,
          user_id: session.user.id,
        }));

        const { error } = await supabase
          .from('categories')
          .insert(categoriesToInsert);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  };

  return (
    <OnboardingContext.Provider value={{ hasCompletedOnboarding, completeOnboarding, saveCategories }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => useContext(OnboardingContext);