const GEMINI_API_KEY = 'AIzaSyCZsfen_MxWzLe7al4SCGDYiS3jWi7CGN0'; // Replace with actual API key
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export interface VoiceTranslationRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface VoiceTranslationResponse {
  translatedText: string;
  audioUrl?: string;
  success: boolean;
  error?: string;
}
// Add this function for the VoiceAssistant component
export const callGeminiAPI = async (userText: string): Promise<string> => {
  try {
    const prompt = `You are an AI agricultural assistant helping Indian farmers. 
    Provide helpful, practical advice for agricultural questions in a friendly, supportive tone.
    Keep responses concise but informative. Focus on Indian farming practices and conditions.
    
    User question: "${userText}"`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!responseText) {
      throw new Error('No response received from Gemini API');
    }

    return responseText;

  } catch (error) {
    console.error('Gemini API call error:', error);
    return 'I apologize, but I encountered an error while processing your request. Please try again.';
  }
};

export const geminiService = {
  async translateText(request: VoiceTranslationRequest): Promise<VoiceTranslationResponse> {
    try {
      const prompt = `Translate the following text from ${request.sourceLanguage} to ${request.targetLanguage}. 
      Provide only the translated text without any additional formatting or explanations:
      
      "${request.text}"`;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 1,
            topP: 1,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!translatedText) {
        throw new Error('No translation received from Gemini API');
      }

      return {
        translatedText,
        success: true
      };

    } catch (error) {
      console.error('Gemini translation error:', error);
      return {
        translatedText: request.text, // Fallback to original text
        success: false,
        error: error instanceof Error ? error.message : 'Translation failed'
      };
    }
  },

  async textToSpeech(text: string, language: string): Promise<string | null> {
    try {
      // For now, we'll use the browser's built-in speech synthesis
      // In a real implementation, you might want to use Gemini's audio generation
      // or integrate with a TTS service like Google Cloud TTS
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Map language codes to speech synthesis languages
      const langMap: Record<string, string> = {
        'en': 'en-US',
        'hi': 'hi-IN',
        'bn': 'bn-IN',
        'mr': 'mr-IN',
        'gu': 'gu-IN'
      };
      
      utterance.lang = langMap[language] || 'en-US';
      
      // Try to find a matching voice
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(voice => voice.lang === utterance.lang);
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }
      
      // Return a promise that resolves when speech is complete
      return new Promise((resolve) => {
        utterance.onend = () => resolve('success');
        utterance.onerror = () => resolve(null);
        window.speechSynthesis.speak(utterance);
      });
      
    } catch (error) {
      console.error('Text-to-speech error:', error);
      return null;
    }
  },

  async translateAndSpeak(text: string, sourceLanguage: string, targetLanguage: string): Promise<VoiceTranslationResponse> {
    try {
      // First translate the text
      const translation = await this.translateText({
        text,
        sourceLanguage,
        targetLanguage
      });

      if (translation.success) {
        // Then convert to speech
        const speechResult = await this.textToSpeech(translation.translatedText, targetLanguage);
        if (speechResult) {
          return {
            ...translation,
            audioUrl: speechResult
          };
        }
      }

      return translation;

    } catch (error) {
      console.error('Translate and speak error:', error);
      return {
        translatedText: text,
        success: false,
        error: error instanceof Error ? error.message : 'Translation and speech failed'
      };
    }
  }
}; 