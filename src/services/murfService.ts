import axios from 'axios';

const MURF_API_KEY = 'YOUR_API_KEY'; // Replace with actual API key
const MURF_TRANSLATE_URL = 'https://api.murf.ai/v1/text/translate';
const MURF_TTS_URL = 'https://api.murf.ai/v1/speech/generate';

export interface TranslationRequest {
  targetLanguage: string;
  texts: string[];
}

export interface TranslationResponse {
  translatedTexts: string[];
  success: boolean;
  error?: string;
}

export interface TTSRequest {
  text: string;
  voiceId: string;
}

export interface TTSResponse {
  audioUrl: string;
  success: boolean;
  error?: string;
}

export const murfService = {
  async translateText(request: TranslationRequest): Promise<TranslationResponse> {
    try {
      const options = {
        method: 'POST',
        url: MURF_TRANSLATE_URL,
        headers: {
          'api-key': MURF_API_KEY,
          'Content-Type': 'application/json',
        },
        data: {
          targetLanguage: request.targetLanguage,
          texts: request.texts,
        },
      };

      const response = await axios.request(options);
      
      if (response.data && response.data.translations) {
        return {
          translatedTexts: response.data.translations,
          success: true,
        };
      } else {
        throw new Error('No translation received');
      }
    } catch (error) {
      console.error('Murf translation error:', error);
      return {
        translatedTexts: request.texts, // Fallback to original texts
        success: false,
        error: error instanceof Error ? error.message : 'Translation failed',
      };
    }
  },

  async textToSpeech(request: TTSRequest): Promise<TTSResponse> {
    try {
      const config = {
        method: 'post',
        url: MURF_TTS_URL,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'api-key': MURF_API_KEY,
        },
        data: {
          text: request.text,
          voiceId: request.voiceId,
        },
      };

      const response = await axios(config);
      
      if (response.data && response.data.audioUrl) {
        return {
          audioUrl: response.data.audioUrl,
          success: true,
        };
      } else {
        throw new Error('No audio URL received');
      }
    } catch (error) {
      console.error('Murf TTS error:', error);
      return {
        audioUrl: '',
        success: false,
        error: error instanceof Error ? error.message : 'Text-to-speech failed',
      };
    }
  },

  // Helper method to get voice ID based on language
  getVoiceIdForLanguage(language: string): string {
    const voiceMap: Record<string, string> = {
      'en': 'en-US-natalie',
      'hi': 'hi-IN-priya',
      'bn': 'bn-IN-rita',
      'mr': 'mr-IN-meera',
      'gu': 'gu-IN-gita',
      'es': 'es-ES-maria',
      'fr': 'fr-FR-sophie',
      'de': 'de-DE-anna',
      'it': 'it-IT-giulia',
      'pt': 'pt-BR-ana',
    };
    
    return voiceMap[language] || 'en-US-natalie';
  },

  // Helper method to get language code for translation
  getLanguageCode(language: string): string {
    const languageMap: Record<string, string> = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'bn': 'bn-IN',
      'mr': 'mr-IN',
      'gu': 'gu-IN',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'it': 'it-IT',
      'pt': 'pt-BR',
    };
    
    return languageMap[language] || 'en-US';
  }
}; 