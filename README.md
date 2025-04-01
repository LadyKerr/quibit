# Quibit 📚

Quibit is a React Native + Expo app that helps you save and organize content you discover across the internet. Think of it as your personal knowledge base that's always in your pocket.

## Features

- 🔗 Save and categorize links (articles, videos, blog posts)
- 🎙️ Record voice notes on the go
- ✍️ Auto-transcribe voice notes for easy searching
- ☁️ Cloud sync across all your devices
- 🔍 Search across all your saved content

## Getting Started

1. Install dependencies
   ```bash
   npm install
   ```

2. Set up environment variables
   ```bash
   cp .env.example .env
   ```
   Add your Supabase credentials to `.env`

3. Start the app
   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## Development

This project uses:
- React Native with Expo
- Supabase for data storage and auth
- AsyncStorage for offline cache
- expo-av for voice recording
- AI-powered voice transcription
- File-based routing

### Project Structure
```
app/
├── screens/         # Main app screens
├── components/      # Reusable UI components
├── hooks/          # Custom hooks
├── utils/          # Helper functions
├── services/       # API and Supabase services
└── types/          # TypeScript definitions
```

### Database Schema

```sql
// Supabase tables
items (
  id uuid primary key
  user_id uuid references auth.users
  title text
  type text -- 'link' or 'voice'
  url text
  voice_url text
  transcript text
  created_at timestamp
  updated_at timestamp
)
```

