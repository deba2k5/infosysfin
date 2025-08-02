import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import bn from './locales/bn.json';
import hi from './locales/hi.json';
import mr from './locales/mr.json';
import gu from './locales/gu.json';

const resources = {
  en: { translation: en },
  bn: { translation: bn },
  hi: { translation: hi },
  mr: { translation: mr },
  gu: { translation: gu },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: ['en', 'bn', 'hi', 'mr', 'gu'],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// State to language mapping
const stateToLang: Record<string, string> = {
  'West Bengal': 'bn',
  'Bengal': 'bn',
  'Maharashtra': 'mr',
  'Gujarat': 'gu',
  'Delhi': 'hi',
  'Uttar Pradesh': 'hi',
  'Madhya Pradesh': 'hi',
  'Bihar': 'hi',
  'Rajasthan': 'hi',
  'Haryana': 'hi',
  'Punjab': 'hi',
  'Chhattisgarh': 'hi',
  'Jharkhand': 'hi',
  'Assam': 'bn', // fallback
  // Add more as needed
};

// Auto-detect location and set language if not manually set
if (!localStorage.getItem('i18n_manual_lang')) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      // Use a free reverse geocoding API (e.g., Nominatim)
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        const data = await res.json();
        const state = data.address?.state;
        if (state && stateToLang[state]) {
          i18n.changeLanguage(stateToLang[state]);
        }
      } catch {}
    });
  }
}

export default i18n; 