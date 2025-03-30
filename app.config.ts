import { ExpoConfig, ConfigContext } from 'expo/config';

// Read from environment variables
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'quibit',
  slug: 'quibit',
  extra: {
    supabaseUrl: SUPABASE_URL,
    supabaseAnonKey: SUPABASE_ANON_KEY,
    eas: {
      projectId: "your-project-id",
    },
  },
});