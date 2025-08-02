import axios from 'axios';

const WHISPER_API_KEY = 'ap2_ace7e494-77bc-496a-bc5a-8e9b58eede14';
const WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';

export interface WhisperResponse {
  text: string;
  success: boolean;
  error?: string;
}

export const whisperService = {
  async transcribeAudio(audioBlob: Blob): Promise<WhisperResponse> {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', 'auto');

      const response = await axios.post(WHISPER_API_URL, formData, {
        headers: {
          'Authorization': `Bearer ${WHISPER_API_KEY}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.text) {
        return {
          text: response.data.text.trim(),
          success: true,
        };
      } else {
        throw new Error('No transcription received');
      }
    } catch (error) {
      console.error('Whisper API error:', error);
      return {
        text: '',
        success: false,
        error: error instanceof Error ? error.message : 'Transcription failed',
      };
    }
  },

  async transcribeAudioWithLanguage(audioBlob: Blob, language: string): Promise<WhisperResponse> {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', language);

      const response = await axios.post(WHISPER_API_URL, formData, {
        headers: {
          'Authorization': `Bearer ${WHISPER_API_KEY}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.text) {
        return {
          text: response.data.text.trim(),
          success: true,
        };
      } else {
        throw new Error('No transcription received');
      }
    } catch (error) {
      console.error('Whisper API error:', error);
      return {
        text: '',
        success: false,
        error: error instanceof Error ? error.message : 'Transcription failed',
      };
    }
  }
}; 