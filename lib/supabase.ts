import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { Database } from './types';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl as string;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    detectSessionInUrl: false,
    storage: {
      // Using AsyncStorage for session persistence in React Native
      getItem: async (key: string) => {
        const { AsyncStorage } = await import('@react-native-async-storage/async-storage');
        return AsyncStorage.getItem(key);
      },
      setItem: async (key: string, value: string) => {
        const { AsyncStorage } = await import('@react-native-async-storage/async-storage');
        return AsyncStorage.setItem(key, value);
      },
      removeItem: async (key: string) => {
        const { AsyncStorage } = await import('@react-native-async-storage/async-storage');
        return AsyncStorage.removeItem(key);
      },
    },
  },
});