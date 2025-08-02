# Voice Assistant Implementation

## Overview

This implementation replaces the Botpress chatbot with a comprehensive AI-powered voice assistant that integrates multiple AI services for speech-to-text, natural language processing, translation, and text-to-speech capabilities.

## Features

### 🎤 Voice Commands
- **Speech-to-Text**: Uses OpenAI Whisper API for accurate voice transcription
- **Multi-language Support**: Supports 8 languages (English, Hindi, Bengali, Marathi, Gujarati, Spanish, French, German)
- **Real-time Processing**: Instant voice input processing and response generation

### 🤖 AI Models
- **Gemini AI**: Google's Gemini model for general agricultural conversations
- **Groq LLM**: Fast inference with Meta's Llama model for technical responses
- **Switchable AI**: Users can switch between Gemini and Groq based on their needs

### 🌐 Multilingual Support
- **Translation**: Murf AI for text translation between supported languages
- **Text-to-Speech**: Murf AI for natural-sounding voice responses
- **Language Detection**: Automatic language detection and appropriate voice selection

### 💬 Chat Interface
- **Text Chat**: Traditional text input for typing messages
- **Voice Chat**: Voice input with real-time transcription
- **Message History**: Persistent chat history with timestamps
- **Translation Display**: Shows both original and translated responses

## Technical Implementation

### Services

#### 1. Whisper Service (`src/services/whisperService.ts`)
```typescript
// Speech-to-text using OpenAI Whisper API
const transcription = await whisperService.transcribeAudioWithLanguage(
  audioBlob, 
  currentLanguage
);
```

#### 2. Gemini Service (`src/services/geminiService.ts`)
```typescript
// AI conversation using Google Gemini
const response = await geminiService.translateText({
  text: userInput,
  sourceLanguage: currentLanguage,
  targetLanguage: currentLanguage
});
```

#### 3. Groq Service (`src/services/groqService.ts`)
```typescript
// Fast inference using Groq's API
const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${GROQ_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: [
      { role: "system", content: "You are an expert agricultural assistant." },
      { role: "user", content: userInput }
    ],
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
  })
});
```

#### 4. Murf Service (`src/services/murfService.ts`)
```typescript
// Translation and Text-to-Speech
const translation = await murfService.translateText({
  targetLanguage: languageCode,
  texts: [text]
});

const ttsResponse = await murfService.textToSpeech({
  text: response,
  voiceId: voiceId
});
```

### Components

#### 1. VoiceAssistant (`src/components/VoiceAssistant.tsx`)
- Full-featured voice assistant component
- Used on the dedicated voice assistant page
- Complete chat interface with all features

#### 2. FloatingVoiceAssistant (`src/components/FloatingVoiceAssistant.tsx`)
- Compact floating chat widget
- Available on all pages
- Quick access to voice assistant functionality

#### 3. VoiceAssistantPage (`src/pages/VoiceAssistantPage.tsx`)
- Dedicated page for voice assistant
- Comprehensive documentation and instructions
- Feature showcase and language support display

## API Keys Required

### 1. OpenAI Whisper API
```typescript
const WHISPER_API_KEY = 'ap2_ace7e494-77bc-496a-bc5a-8e9b58eede14';
```

### 2. Google Gemini API
```typescript
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';
```

### 3. Groq API
```typescript
const GROQ_API_KEY = '<REDACTED_FOR_GITHUB>'; // Set via environment variable
```

### 4. Murf AI API
```typescript
const MURF_API_KEY = 'YOUR_MURF_API_KEY';
```

## Usage

### Voice Commands
1. Click the microphone button
2. Speak clearly in your preferred language
3. Release to send your message
4. Wait for AI response
5. Enable text-to-speech to hear responses

### Text Chat
1. Type your message in the input field
2. Press Enter or click Send
3. Switch between Gemini and Groq AI as needed
4. Enable translation for multilingual responses

### Language Support
- **English**: en-US-natalie
- **Hindi**: hi-IN-priya
- **Bengali**: bn-IN-rita
- **Marathi**: mr-IN-meera
- **Gujarati**: gu-IN-gita
- **Spanish**: es-ES-maria
- **French**: fr-FR-sophie
- **German**: de-DE-anna

## Integration Points

### Navigation
- Added to main navigation menu
- Quick access from dashboard
- Floating button on all pages

### Dashboard Integration
- Added as a quick action card
- Direct link to voice assistant page
- Seamless integration with existing features

### Translation Support
- Added translation keys for all supported languages
- English and Hindi translations included
- Extensible for additional languages

## Benefits Over Botpress

### 1. **Cost Efficiency**
- No monthly Botpress subscription
- Pay-per-use API model
- Scalable pricing based on usage

### 2. **Better AI Models**
- Access to latest AI models (Gemini, Groq)
- Faster response times
- More accurate agricultural knowledge

### 3. **Multilingual Support**
- Native support for Indian languages
- Real-time translation
- Natural-sounding voice responses

### 4. **Customization**
- Full control over UI/UX
- Customizable responses
- Integration with existing features

### 5. **Privacy**
- No third-party chat widget
- Direct API integration
- Better data control

## Future Enhancements

### 1. **Advanced Features**
- Voice emotion detection
- Context-aware conversations
- Personalized responses

### 2. **Integration**
- Weather data integration
- Crop health analysis
- Market price queries

### 3. **Accessibility**
- Voice navigation
- Screen reader support
- Keyboard shortcuts

### 4. **Analytics**
- Usage analytics
- Response quality metrics
- User feedback collection

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure API Keys**
   - Update API keys in respective service files
   - Ensure all services are properly configured

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Test Voice Assistant**
   - Navigate to `/voice-assistant` page
   - Test voice commands and text chat
   - Verify multilingual support

## Troubleshooting

### Common Issues

1. **Microphone Access**
   - Ensure browser permissions are granted
   - Check HTTPS requirement for media access

2. **API Errors**
   - Verify API keys are correct
   - Check API quotas and limits
   - Monitor network connectivity

3. **Translation Issues**
   - Verify Murf API key
   - Check language code mappings
   - Test with different languages

### Performance Optimization

1. **Audio Processing**
   - Optimize audio format (WebM with Opus codec)
   - Implement audio compression
   - Add loading indicators

2. **Response Caching**
   - Cache common responses
   - Implement request deduplication
   - Optimize API calls

## Security Considerations

1. **API Key Management**
   - Use environment variables
   - Implement key rotation
   - Monitor API usage

2. **Data Privacy**
   - Minimize data collection
   - Implement data retention policies
   - Secure data transmission

3. **User Authentication**
   - Integrate with existing auth system
   - Implement rate limiting
   - Monitor for abuse

## Conclusion

This voice assistant implementation provides a comprehensive, multilingual AI chat solution that significantly enhances the user experience while reducing costs compared to Botpress. The modular architecture allows for easy customization and future enhancements, making it a robust foundation for agricultural advisory services. 