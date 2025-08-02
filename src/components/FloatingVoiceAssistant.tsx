import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, MicOff, Send, Volume2, VolumeX, Languages, Bot, User, X, MessageCircle } from 'lucide-react';
import { whisperService } from '@/services/whisperService';
import { geminiService } from '@/services/geminiService';
import { groqService, GROQ_API_KEY } from '@/services/groqService';
import { murfService } from '@/services/murfService';
import { useTranslation } from 'react-i18next';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  language?: string;
  translatedText?: string;
}

const FloatingVoiceAssistant: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [useGemini, setUseGemini] = useState(true);
  const [enableTranslation, setEnableTranslation] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('en');

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'mr', name: 'मराठी' },
    { code: 'gu', name: 'ગુજરાતી' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
  ];

  // Initialize media recorder
  useEffect(() => {
    const initializeRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus'
        });

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            setAudioChunks(prev => [...prev, event.data]);
          }
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          setAudioChunks([]);
          await processAudioInput(audioBlob);
        };

        setMediaRecorder(recorder);
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    };

    if (isOpen) {
      initializeRecorder();
    }
  }, [isOpen]);

  const processAudioInput = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      const transcription = await whisperService.transcribeAudioWithLanguage(
        audioBlob, 
        currentLanguage
      );

      if (transcription.success) {
        const userMessage: Message = {
          id: Date.now().toString(),
          text: transcription.text,
          sender: 'user',
          timestamp: new Date(),
          language: currentLanguage,
        };

        setMessages(prev => [...prev, userMessage]);
        await generateResponse(transcription.text);
      } else {
        console.error('Transcription failed:', transcription.error);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateResponse = async (userInput: string) => {
    try {
      let response = '';
      
      if (useGemini) {
        const geminiResponse = await geminiService.translateText({
          text: `You are a helpful agricultural assistant. Respond to: "${userInput}" in a helpful and informative way. Keep your response concise and practical for farmers.`,
          sourceLanguage: currentLanguage,
          targetLanguage: currentLanguage
        });
        response = geminiResponse.translatedText;
      } else {
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content: "You are an expert agricultural assistant. Provide helpful, practical advice for farmers."
              },
              {
                role: "user",
                content: userInput
              }
            ],
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            temperature: 0.7,
            max_tokens: 500,
          })
        });

        const data = await groqResponse.json();
        response = data.choices[0].message.content;
      }

      let translatedResponse = response;
      if (enableTranslation && targetLanguage !== currentLanguage) {
        const translation = await murfService.translateText({
          targetLanguage: murfService.getLanguageCode(targetLanguage),
          texts: [response]
        });
        if (translation.success) {
          translatedResponse = translation.translatedTexts[0];
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'assistant',
        timestamp: new Date(),
        language: currentLanguage,
        translatedText: enableTranslation ? translatedResponse : undefined,
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (isSpeaking) {
        await speakText(translatedResponse || response, targetLanguage);
      }
    } catch (error) {
      console.error('Error generating response:', error);
    }
  };

  const speakText = async (text: string, language: string) => {
    try {
      const voiceId = murfService.getVoiceIdForLanguage(language);
      const ttsResponse = await murfService.textToSpeech({
        text,
        voiceId
      });

      if (ttsResponse.success && ttsResponse.audioUrl) {
        const audio = new Audio(ttsResponse.audioUrl);
        audio.play();
      } else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = murfService.getLanguageCode(language);
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Error speaking text:', error);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = murfService.getLanguageCode(language);
      window.speechSynthesis.speak(utterance);
    }
  };

  const startRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'inactive') {
      setAudioChunks([]);
      mediaRecorder.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      language: currentLanguage,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    await generateResponse(inputText);
  };

  const toggleSpeaking = () => {
    setIsSpeaking(!isSpeaking);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="w-14 h-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="w-80 h-96 shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Bot className="h-4 w-4" />
              {t('voiceAssistant')}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={useGemini ? "default" : "secondary"} className="text-xs">
                {useGemini ? 'Gemini' : 'Groq'}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Language Controls */}
          <div className="flex items-center gap-2 text-xs">
            <Languages className="h-3 w-3" />
            <select
              value={currentLanguage}
              onChange={(e) => setCurrentLanguage(e.target.value)}
              className="text-xs border rounded px-1 py-0.5"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUseGemini(!useGemini)}
              className="text-xs h-6 px-2"
            >
              {t('switchAI')}
            </Button>
          </div>

          {/* Voice Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              variant={isRecording ? "destructive" : "default"}
              size="sm"
              className="w-10 h-10 rounded-full"
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            
            <Button
              onClick={toggleSpeaking}
              variant={isSpeaking ? "default" : "outline"}
              size="sm"
              className="text-xs"
            >
              {isSpeaking ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
            </Button>

            <Button onClick={clearMessages} variant="outline" size="sm" className="text-xs">
              {t('clearChat')}
            </Button>
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="text-center text-blue-500 text-xs">
              {t('processingVoiceInput')}
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="h-48 w-full border rounded p-2">
            <div className="space-y-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-48 p-2 rounded text-xs ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      {message.sender === 'user' ? (
                        <User className="h-2 w-2" />
                      ) : (
                        <Bot className="h-2 w-2" />
                      )}
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs">{message.text}</p>
                    {message.translatedText && (
                      <div className="mt-1 pt-1 border-t border-dashed">
                        <p className="text-xs opacity-70">Translated:</p>
                        <p className="text-xs">{message.translatedText}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Text Input */}
          <form onSubmit={handleTextSubmit} className="flex gap-1">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t('typeYourMessage')}
              disabled={isProcessing}
              className="flex-1 text-xs h-8"
            />
            <Button type="submit" disabled={isProcessing || !inputText.trim()} size="sm" className="h-8 w-8 p-0">
              <Send className="h-3 w-3" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FloatingVoiceAssistant; 