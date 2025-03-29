Quirbit is a React Native + Expo app that helps users save and organize content they find on the internet. Users can:

- Add and categorize links (e.g., blog posts, guides, videos)
- Record voice notes
- Transcribe those voice notes for searchable reference

Use `AsyncStorage` for local data persistence. Each saved item should include a title, type (link or voice note), and timestamp. Voice recordings use `expo-av` and transcripts are generated via an AI API (e.g., OpenAI Whisper).

The UI should be minimal, accessible, and easy to navigate. Prioritize offline usability and quick input for both text and audio.

App structure includes:
- Home screen: list of saved items
- Add screen: input for new link or record voice
- Detail screen: view individual saved content

Focus on modular, well-documented components and reusable hooks where possible.
