import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Volume2, Loader2 } from 'lucide-react';
import { geminiService } from '@/services/geminiService';

const LANG_TO_SPEECH = {
  en: 'en-US',
  bn: 'bn-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
};

const isSpeechSupported = (lang: string) => {
  const voices = window.speechSynthesis.getVoices();
  return voices.some(v => v.lang === LANG_TO_SPEECH[lang as keyof typeof LANG_TO_SPEECH]);
};

const SpeakButton: React.FC<{ textKey: string }> = ({ textKey }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const speak = async () => {
    const text = t(textKey);
    setIsSpeaking(true);
    setIsLoading(true);

    try {
      // Check if browser supports speech synthesis for this language
      const supported = isSpeechSupported(lang);
      
      if (supported) {
        // Use browser's built-in speech synthesis
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = LANG_TO_SPEECH[lang as keyof typeof LANG_TO_SPEECH] || 'en-US';
        
        // Try to use a matching voice
        const voices = window.speechSynthesis.getVoices();
        const match = voices.find(v => v.lang === utterance.lang);
        if (match) utterance.voice = match;
        
        utterance.onend = () => {
          setIsSpeaking(false);
          setIsLoading(false);
        };
        
        utterance.onerror = () => {
          setIsSpeaking(false);
          setIsLoading(false);
        };
        
        window.speechSynthesis.speak(utterance);
      } else {
        // Use Gemini API for translation and TTS
        const result = await geminiService.translateAndSpeak(text, lang, 'en');
        
        if (result.success) {
          // Speak the translated text in English
          const utterance = new SpeechSynthesisUtterance(result.translatedText);
          utterance.lang = 'en-US';
          
          utterance.onend = () => {
            setIsSpeaking(false);
            setIsLoading(false);
          };
          
          utterance.onerror = () => {
            setIsSpeaking(false);
            setIsLoading(false);
          };
          
          window.speechSynthesis.speak(utterance);
        } else {
          // Fallback to English speech synthesis
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'en-US';
          
          utterance.onend = () => {
            setIsSpeaking(false);
            setIsLoading(false);
          };
          
          utterance.onerror = () => {
            setIsSpeaking(false);
            setIsLoading(false);
          };
          
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (error) {
      console.error('Speech error:', error);
      setIsSpeaking(false);
      setIsLoading(false);
      
      // Show fallback message
      alert(t('ttsNotSupported'));
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsLoading(false);
  };

  const supported = isSpeechSupported(lang);

  return (
    <button
      onClick={() => {
        if (isSpeaking) {
          stop();
        } else {
          speak();
        }
      }}
      className="ml-1 p-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 shadow-sm flex items-center justify-center transition-all duration-200"
      title={supported ? t('speak') : t('ttsNotSupported')}
      style={{ width: 28, height: 28 }}
      aria-label={t('speak')}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Volume2 className="w-4 h-4" />
      )}
    </button>
  );
};

export default SpeakButton; 