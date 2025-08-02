import React from 'react';
import { useTranslation } from 'react-i18next';
import VoiceAssistant from '@/components/VoiceAssistant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, Brain, Languages, Volume2 } from 'lucide-react';
import SpeakButton from '@/components/SpeakButton';
import ReadPageButton from '@/components/ReadPageButton';

const VoiceAssistantPage: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Mic,
      title: t('voiceCommands'),
      description: t('speakNaturally'),
      color: 'text-blue-500'
    },
    {
      icon: Brain,
      title: t('aiPowered'),
      description: t('geminiAndGroq'),
      color: 'text-green-500'
    },
    {
      icon: Languages,
      title: t('multilingual'),
      description: t('supportMultipleLanguages'),
      color: 'text-purple-500'
    },
    {
      icon: Volume2,
      title: t('textToSpeech'),
      description: t('hearResponses'),
      color: 'text-orange-500'
    }
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-full">
            <Mic className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              {t('voiceAssistant')} <SpeakButton textKey="voiceAssistant" />
            </h1>
            <p className="text-muted-foreground">
              {t('aiPoweredVoiceAssistant')}
            </p>
          </div>
        </div>
        <ReadPageButton text={t('voiceAssistantPageReadout')} />
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature, index) => (
          <Card key={index} className="text-center">
            <CardContent className="pt-6">
              <feature.icon className={`h-8 w-8 mx-auto mb-3 ${feature.color}`} />
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Models Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {t('poweredBy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Badge variant="default" className="text-sm">
              <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_24x24_color.png" 
                   alt="Gemini" className="w-4 h-4 mr-1" />
              Gemini AI
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <img src="https://groq.com/favicon.ico" 
                   alt="Groq" className="w-4 h-4 mr-1" />
              Groq LLM
            </Badge>
            <Badge variant="outline" className="text-sm">
              <img src="https://openai.com/favicon.ico" 
                   alt="Whisper" className="w-4 h-4 mr-1" />
              Whisper STT
            </Badge>
            <Badge variant="outline" className="text-sm">
              <img src="https://murf.ai/favicon.ico" 
                   alt="Murf" className="w-4 h-4 mr-1" />
              Murf TTS
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Voice Assistant Component */}
      <VoiceAssistant />

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('howToUse')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">{t('voiceCommands')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• {t('clickMicButton')}</li>
                <li>• {t('speakClearly')}</li>
                <li>• {t('releaseToSend')}</li>
                <li>• {t('waitForResponse')}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">{t('textChat')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• {t('typeInInput')}</li>
                <li>• {t('pressEnterOrSend')}</li>
                <li>• {t('switchBetweenAI')}</li>
                <li>• {t('enableTranslation')}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supported Languages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            {t('supportedLanguages')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { code: 'en', name: 'English', native: 'English' },
              { code: 'hi', name: 'Hindi', native: 'हिंदी' },
              { code: 'bn', name: 'Bengali', native: 'বাংলা' },
              { code: 'mr', name: 'Marathi', native: 'मराठी' },
              { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
              { code: 'es', name: 'Spanish', native: 'Español' },
              { code: 'fr', name: 'French', native: 'Français' },
              { code: 'de', name: 'German', native: 'Deutsch' },
            ].map((lang) => (
              <div key={lang.code} className="flex items-center gap-2 p-2 border rounded">
                <span className="text-sm font-medium">{lang.native}</span>
                <span className="text-xs text-muted-foreground">({lang.name})</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceAssistantPage; 