import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

// Constants
const ONBOARDING_COMPLETE_KEY = '@quibit/onboarding_complete';
const USER_CATEGORIES_KEY = '@quibit/user_categories';
const DEFAULT_CATEGORIES = ['Blog', 'Tutorial', 'Video', 'Article', 'Other'];

// Types
interface Category {
  id?: string;
  name: string;
  user_id?: string;
}

interface OnboardingContextData {
  hasCompletedOnboarding: boolean;
  isLoading: boolean;
  categories: string[];
  completeOnboarding: () => Promise<void>;
  saveCategories: (categories: string[]) => Promise<void>;
  resetOnboarding: () => Promise<void>;
  getUserCategories: () => Promise<string[]>;
}

// Context
const OnboardingContext = createContext<OnboardingContextData>({} as OnboardingContextData);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const { session } = useAuth();

  useEffect(() => {
    initializeOnboarding();
  }, []);

  const initializeOnboarding = async () => {
    try {
      const [status, savedCategories] = await Promise.all([
        AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY),
        AsyncStorage.getItem(USER_CATEGORIES_KEY),
      ]);

      setHasCompletedOnboarding(!!status);
      if (savedCategories) {
        setCategories([...DEFAULT_CATEGORIES, ...JSON.parse(savedCategories)]);
      }
    } catch (error) {
      console.error('Error initializing onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      setIsLoading(true);
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw new Error('Failed to complete onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  const saveCategories = async (newCategories: string[]) => {
    if (!session?.user?.id) return;

    try {
      setIsLoading(true);
      const customCategories = newCategories.filter(cat => !DEFAULT_CATEGORIES.includes(cat));
      
      // Save to local storage
      await AsyncStorage.setItem(USER_CATEGORIES_KEY, JSON.stringify(customCategories));
      
      // Save to Supabase
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

      setCategories([...DEFAULT_CATEGORIES, ...customCategories]);
    } catch (error) {
      console.error('Error saving categories:', error);
      throw new Error('Failed to save categories');
    } finally {
      setIsLoading(false);
    }
  };

  const resetOnboarding = async () => {
    try {
      setIsLoading(true);
      await AsyncStorage.multiRemove([ONBOARDING_COMPLETE_KEY, USER_CATEGORIES_KEY]);
      setHasCompletedOnboarding(false);
      setCategories(DEFAULT_CATEGORIES);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      throw new Error('Failed to reset onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  const getUserCategories = async (): Promise<string[]> => {
    try {
      const savedCategories = await AsyncStorage.getItem(USER_CATEGORIES_KEY);
      return savedCategories ? JSON.parse(savedCategories) : [];
    } catch (error) {
      console.error('Error getting user categories:', error);
      return [];
    }
  };

  return (
    <OnboardingContext.Provider 
      value={{ 
        hasCompletedOnboarding, 
        isLoading,
        categories,
        completeOnboarding, 
        saveCategories,
        resetOnboarding,
        getUserCategories
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => useContext(OnboardingContext);