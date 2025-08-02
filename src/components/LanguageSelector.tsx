import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { locationService } from '@/services/locationService';
import { MapPin, Globe, Settings } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'mr', label: 'मराठी' },
  { code: 'gu', label: 'ગુજરાતી' },
];

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const [manualLocation, setManualLocation] = useState('');
  const [autoMode, setAutoMode] = useState(true);
  const [currentState, setCurrentState] = useState('');
  const [currentCity, setCurrentCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(false);

  // Initialize on component mount
  useEffect(() => {
    initializeLanguage();
  }, []);

  const initializeLanguage = async () => {
    // Check if there's a manually set language that should persist
    if (locationService.isManualLanguageSet()) {
      const manualLang = locationService.getManualLanguage();
      if (manualLang && manualLang !== i18n.language) {
        i18n.changeLanguage(manualLang);
      }
      setAutoMode(false);
      return;
    }

    // Check if we have cached location
    const cachedLocation = locationService.getCurrentLocation();
    if (cachedLocation) {
      setCurrentState(cachedLocation.state);
      setCurrentCity(cachedLocation.city);
      if (cachedLocation.language !== i18n.language) {
        i18n.changeLanguage(cachedLocation.language);
      }
      setAutoMode(false);
      return;
    }

    // Auto-detect location and set language
    if (autoMode) {
      await detectAndSetLocation();
    }
  };

  const detectAndSetLocation = async () => {
    setLoading(true);
    try {
      const result = await locationService.detectLocation();
      if (result.success && result.location) {
        setCurrentState(result.location.state);
        setCurrentCity(result.location.city);
        if (result.location.language !== i18n.language) {
          i18n.changeLanguage(result.location.language);
        }
      }
    } catch (error) {
      console.error('Location detection failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    i18n.changeLanguage(newLanguage);
    
    // Set manual language to persist
    locationService.setManualLanguage(newLanguage);
    setAutoMode(false);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualLocation(e.target.value);
  };

  const handleManualLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualLocation.trim()) return;
    
    setLoading(true);
    try {
      const result = await locationService.setManualLocation(manualLocation);
      if (result.success && result.location) {
        setCurrentState(result.location.state);
        setCurrentCity(result.location.city);
        if (result.location.language !== i18n.language) {
          i18n.changeLanguage(result.location.language);
        }
        setAutoMode(false);
        setShowLocationInput(false);
      }
    } catch (error) {
      console.error('Manual location setting failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoMode = async () => {
    setAutoMode(true);
    locationService.clearManualLanguage();
    setCurrentState('');
    setCurrentCity('');
    setManualLocation('');
    setShowLocationInput(false);
    
    // Detect location and set language
    await detectAndSetLocation();
  };

  const toggleLocationInput = () => {
    setShowLocationInput(!showLocationInput);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Language Selector */}
      <div className="flex items-center gap-1">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <select
          value={i18n.language}
          onChange={handleLanguageChange}
          className="px-2 py-1 text-sm border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          style={{ minWidth: 100 }}
          aria-label="Select language"
        >
          {LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.label}</option>
          ))}
        </select>
      </div>

      {/* Auto/Manual Mode Toggle */}
      <button
        onClick={handleAutoMode}
        className={`px-2 py-1 text-xs rounded border transition-colors ${
          autoMode 
            ? 'bg-primary text-primary-foreground border-primary' 
            : 'bg-background text-foreground border-border hover:bg-accent'
        }`}
        disabled={loading}
      >
        {loading ? '...' : 'Auto'}
      </button>

      {/* Location Input Toggle */}
      <button
        onClick={toggleLocationInput}
        className={`p-1 rounded border transition-colors ${
          showLocationInput 
            ? 'bg-primary text-primary-foreground border-primary' 
            : 'bg-background text-foreground border-border hover:bg-accent'
        }`}
        title="Set location manually"
      >
        <MapPin className="h-4 w-4" />
      </button>

      {/* Location Input */}
      {showLocationInput && (
        <form onSubmit={handleManualLocationSubmit} className="flex items-center gap-1">
          <input
            type="text"
            placeholder="Enter city/state"
            value={manualLocation}
            onChange={handleLocationChange}
            className="px-2 py-1 text-xs border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            style={{ minWidth: 120 }}
            disabled={loading}
          />
          <button 
            type="submit" 
            className="px-2 py-1 text-xs rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors" 
            disabled={loading}
          >
            {loading ? '...' : 'Set'}
          </button>
        </form>
      )}

      {/* Current Location Display */}
      {!autoMode && (currentCity || currentState) && (
        <div className="text-xs text-muted-foreground hidden md:block">
          {currentCity && `${currentCity}, `}{currentState}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector; 