import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Phone,
  Clock,
  Star,
  Bot,
  Languages,
  Headphones
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SpeakButton from '@/components/SpeakButton';

const Advisory = () => {
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState('english');

  const advisoryServices = [
    {
      title: t('aiChatAssistant'),
      description: t('getInstantAnswers'),
      icon: Bot,
      features: [t('availability'), t('multiLanguageSupport'), t('cropSpecificAdvice')],
    },
    {
      title: t('voiceAdvisory'),
      description: t('callAgriculturalExperts'),
      icon: Phone,
      features: [t('expertConsultation'), t('regionalLanguageSupport'), t('emergencyAdvice')],
    }
  ];

  const recentQueries = [
    {
      id: 1,
      question: t('bestTimeToPlant'),
      answer: t('tomatoPlantingAnswer'),
      time: `2 ${t('hoursAgo')}`,
      rating: 5,
      expert: 'Dr. Rajesh Kumar'
    },
    {
      id: 2,
      question: t('howToControlAphids'),
      answer: t('aphidControlAnswer'),
      time: `1 ${t('dayAgo')}`,
      rating: 4,
      expert: t('aiChatAssistant')
    },
    {
      id: 3,
      question: t('soilTestingProcedure'),
      answer: t('soilTestingAnswer'),
      time: `2 ${t('daysAgo')}`,
      rating: 5,
      expert: 'Prof. Sunita Devi'
    }
  ];

  const experts = [
    {
      name: 'Dr. Rajesh Kumar',
      specialization: t('cropProtection'),
      experience: `15 ${t('years')}`,
      rating: 4.8,
      languages: ['Hindi', 'English', 'Marathi'],
      available: true
    },
    {
      name: 'Prof. Sunita Devi',
      specialization: t('soilScience'),
      experience: `12 ${t('years')}`,
      rating: 4.9,
      languages: ['Hindi', 'English', 'Punjabi'],
      available: false
    },
    {
      name: 'Dr. Amit Sharma',
      specialization: t('plantPathology'),
      experience: `18 ${t('years')}`,
      rating: 4.7,
      languages: ['Hindi', 'English', 'Gujarati'],
      available: true
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">{t('advisory')} <SpeakButton textKey="advisory" /></h1>
          <p className="text-muted-foreground mt-1">{t('getAdvice')}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Languages className="h-5 w-5 text-primary" />
          <Badge variant="outline" className="text-xs">
            {t('multiLanguageSupport')}
          </Badge>
        </div>
      </div>

      {/* Botpress AI Chat Assistant */}
      <Card className="agri-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <span>{t('aiChatAssistant')} AgriSmart</span>
          </CardTitle>
          <CardDescription>
            {t('askAnyFarmingQuestion')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0" style={{ height: '400px' }}>
          <iframe
            title="Botpress Chatbot"
            src="https://cdn.botpress.cloud/webchat/v3.2/shareable.html?configUrl=https://files.bpcontent.cloud/2025/07/11/07/20250711075010-F5LLG51T.json"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '0 0 8px 8px',
            }}
            allow="microphone; camera"
          />
        </CardContent>
      </Card>

      {/* Advisory Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {advisoryServices.map((service) => {
          const Icon = service.icon;
          return (
            <Card key={service.title} className="agri-card">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <CardDescription className="text-sm">{service.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {service.features.map((feature, i) => (
                    <div key={i} className="flex items-center space-x-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                <Button className="w-full gradient-primary">{t('tryNow')}</Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Expert Consultation & Recent Queries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Experts */}
        <Card className="agri-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Headphones className="h-5 w-5" />
              <span>{t('expertConsultation')}</span>
            </CardTitle>
            <CardDescription>{t('connectWithExperts')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {experts.map((expert) => (
              <div key={expert.name} className="p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{expert.name}</h4>
                  <Badge
                    className={
                      expert.available
                        ? 'text-green-400 bg-green-400/20'
                        : 'text-red-400 bg-red-400/20'
                    }
                  >
                    {expert.available ? t('available') : t('busy')}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <p className="text-muted-foreground">{t('specialization')}</p>
                    <p className="font-medium">{expert.specialization}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t('experience')}</p>
                    <p className="font-medium">{expert.experience}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{expert.rating}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{expert.languages.join(', ')}</div>
                </div>
                <Button
                  className="w-full mt-3 gradient-accent"
                  size="sm"
                  disabled={!expert.available}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  {t('callExpert')}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Queries */}
        <Card className="agri-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>{t('recentQueries')}</span>
            </CardTitle>
            <CardDescription>{t('yourRecentQuestions')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentQueries.map((query) => (
              <div key={query.id} className="p-4 rounded-lg bg-secondary/50 space-y-3">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-sm">{query.question}</h4>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < query.rating ? 'text-yellow-400 fill-current' : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{query.answer}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t('by')}: {query.expert}</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{query.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Advisory;
