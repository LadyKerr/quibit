import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { Database } from './types';

// Try to get from Constants first, then fallback to process.env for development
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 
                   process.env.EXPO_PUBLIC_SUPABASE_URL || 
                   'https://placeholder.supabase.co';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 
                       process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
                       'placeholder-anon-key';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    detectSessionInUrl: true,
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    storageKey: '@supabase.auth.token',
    flowType: 'pkce',
    onAuthStateChange: (event, session) => {
      console.log('Supabase auth event:', event);
      console.log('Session:', session?.user?.email);
    },
  },
});