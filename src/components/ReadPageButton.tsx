import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Pause, Play, Square } from 'lucide-react';

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

const ReadPageButton: React.FC<{ text: string }> = ({ text }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = () => {
    if (!text) return;
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = LANG_TO_SPEECH[lang as keyof typeof LANG_TO_SPEECH] || 'en-US';
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find(v => v.lang === utterance.lang);
    if (match) utterance.voice = match;
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setIsPaused(false);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const pause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  };

  const resume = () => {
    window.speechSynthesis.resume();
    setIsPaused(false);
  };

  const supported = isSpeechSupported(lang);

  return (
    <span className="flex items-center gap-1">
      <button
        onClick={() => {
                  if (!supported) {
          alert(t('ttsNotSupported'));
          return;
        }
          speak();
        }}
        className="ml-1 p-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 shadow-sm flex items-center justify-center"
        title={supported ? t('readPage') : t('ttsNotSupported')}
        style={{ width: 28, height: 28 }}
        aria-label={t('readPage')}
        disabled={isSpeaking}
      >
        <BookOpen className="w-4 h-4" />
      </button>
      {isSpeaking && (
        <>
          {isPaused ? (
            <button
              onClick={resume}
              className="p-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 shadow-sm flex items-center justify-center"
              title={t('resume')}
              style={{ width: 28, height: 28 }}
              aria-label={t('resume')}
            >
              <Play className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={pause}
              className="p-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 shadow-sm flex items-center justify-center"
              title={t('pause')}
              style={{ width: 28, height: 28 }}
              aria-label={t('pause')}
            >
              <Pause className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={stop}
            className="p-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 shadow-sm flex items-center justify-center"
            title={t('stop')}
            style={{ width: 28, height: 28 }}
            aria-label={t('stop')}
          >
            <Square className="w-4 h-4" />
          </button>
        </>
      )}
    </span>
  );
};

export default ReadPageButton; 