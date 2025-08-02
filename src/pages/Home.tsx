import React from 'react';
import { useTranslation } from 'react-i18next';
import SpeakButton from '@/components/SpeakButton';

const Home = () => {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">{t('home')} <SpeakButton textKey="home" /></h1>
      <p className="text-muted-foreground mt-1">{t('welcome_message')}</p>
      {/* Add more content and use t('key') for all static text */}
    </div>
  );
};

export default Home; 