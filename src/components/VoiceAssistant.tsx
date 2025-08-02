// Add these imports at the top of your voice assistant component
import { callGeminiAPI } from '../services/geminiService';
import { callGroqAPI } from '../services/groqService';
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, VolumeX, Trash2, MessageSquare, Bot, Headphones } from 'lucide-react';

interface VoiceAssistantPageProps {
  t: (key: string) => string;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const VoiceAssistantPage: React.FC<VoiceAssistantPageProps> = ({ t }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedAI, setSelectedAI] = useState<'gemini' | 'groq'>('gemini');
  const [translationEnabled, setTranslationEnabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'hi-IN'; // Default to Hindi
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleUserMessage(transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsListening(false);
        setIsProcessing(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
        setIsProcessing(false);
      };
    }
    
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      setIsProcessing(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setIsProcessing(false);
    }
  };

  // UPDATED: Replace the old handleUserMessage function with this async version
  const handleUserMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);

    try {
      const aiResponse = await generateAIResponse(text.trim());
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Speak the response if translation is enabled
      if (translationEnabled && synthRef.current) {
        speakText(aiResponse);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, something went wrong. Please try again.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  // UPDATED: Replace the old generateAIResponse function with this async version
  const generateAIResponse = async (userText: string): Promise<string> => {
    try {
      if (selectedAI === 'gemini') {
        return await callGeminiAPI(userText);
      } else if (selectedAI === 'groq') {
        return await callGroqAPI(userText);
      }
      
      return 'Please select an AI model to continue.';
    } catch (error) {
      console.error('API call failed:', error);
      return 'Sorry, I encountered an error while processing your request. Please try again.';
    }
  };

  const speakText = (text: string) => {
    if (synthRef.current && !isSpeaking) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
      };
      
      synthRef.current.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    stopSpeaking();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleUserMessage(inputText);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{t('voiceAssistant')}</h1>
                <p className="text-gray-600">{t('aiPoweredVoiceAssistant')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedAI(selectedAI === 'gemini' ? 'groq' : 'gemini')}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                {selectedAI === 'gemini' ? 'Gemini' : 'Groq'} AI
              </button>
              <button
                onClick={() => setTranslationEnabled(!translationEnabled)}
                className={`p-2 rounded-lg transition-colors ${
                  translationEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {translationEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <Mic className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">{t('voiceCommands')}</p>
                <p className="text-sm text-green-600">{t('speakNaturally')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Bot className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">{t('geminiAndGroq')}</p>
                <p className="text-sm text-blue-600">{t('supportMultipleLanguages')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <Headphones className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium text-purple-800">{t('hearResponses')}</p>
                <p className="text-sm text-purple-600">{t('poweredBy')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 flex flex-col h-96">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold text-gray-800">AI Chat</h2>
            <button
              onClick={clearChat}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>{t('getInstantAnswers')}</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    message.isUser
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${message.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-2xl">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    <p className="text-sm">{t('processingVoiceInput')}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Voice Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="text-center">
            <button
              onMouseDown={startListening}
              onMouseUp={stopListening}
              onTouchStart={startListening}
              onTouchEnd={stopListening}
              disabled={isProcessing}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ${
                isListening
                  ? 'bg-red-500 text-white shadow-lg scale-110'
                  : 'bg-green-500 text-white hover:bg-green-600 hover:scale-105'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>
            
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">
                {isListening ? t('speakingOn') : t('speakingOff')}
              </p>
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Stop Speaking
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Text Input */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t('typeYourMessage')}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isProcessing}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* How to Use Guide */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
          <h3 className="font-semibold text-gray-800 mb-4">{t('howToUse')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-green-700">{t('voiceCommands')}</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• {t('clickMicButton')}</li>
                <li>• {t('speakClearly')}</li>
                <li>• {t('releaseToSend')}</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-blue-700">{t('textChat')}</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• {t('typeInInput')}</li>
                <li>• {t('pressEnterOrSend')}</li>
                <li>• {t('switchBetweenAI')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistantPage;