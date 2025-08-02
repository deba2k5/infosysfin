import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { locationService } from '@/services/locationService';
import { MapPin, Mail, Phone, Globe } from 'lucide-react';

const services = [
  { key: 'dashboard', href: '/dashboard' },
  { key: 'weather', href: '/weather' },
  { key: 'marketPrices', href: '/market-prices' },
  { key: 'insurance', href: '/insurance' },
  { key: 'loanEligibility', href: '/loan-eligibility' },
  { key: 'cropPlanning', href: '/crop-planning' },
  { key: 'advisory', href: '/advisory' },
];

const Footer: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [isAutoMode, setIsAutoMode] = useState(true);

  useEffect(() => {
    // Initialize location display
    updateLocationDisplay();
  }, []);

  const updateLocationDisplay = async () => {
    try {
      // Check if manual language is set
      if (locationService.isManualLanguageSet()) {
        setIsAutoMode(false);
        setCurrentLocation('Manual Selection');
        return;
      }

      // Get current location
      const location = locationService.getCurrentLocation();
      if (location) {
        setIsAutoMode(false);
        setCurrentLocation(`${location.city ? location.city + ', ' : ''}${location.state}`);
        return;
      }

      // Auto-detect location
      const result = await locationService.detectLocation();
      if (result.success && result.location) {
        setIsAutoMode(false);
        setCurrentLocation(`${result.location.city ? result.location.city + ', ' : ''}${result.location.state}`);
      } else {
        setIsAutoMode(true);
        setCurrentLocation('Auto-detecting...');
      }
    } catch (error) {
      console.error('Footer location update error:', error);
      setIsAutoMode(true);
      setCurrentLocation('Location unavailable');
    }
  };

  return (
    <footer className="w-full bg-background/95 border-t border-primary/10 mt-8 py-8 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-primary flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {t('contact')}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a 
                  href="mailto:debangshuchatterjee2005@gmail.com" 
                  className="text-foreground/80 hover:text-primary transition-colors"
                >
                  debangshuchatterjee2005@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a 
                  href="tel:6290277345" 
                  className="text-foreground/80 hover:text-primary transition-colors"
                >
                  6290277345
                </a>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold text-primary flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {t('ourServices')}
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {services.map(service => (
                <a
                  key={service.href}
                  href={service.href}
                  className="text-foreground/80 hover:text-primary transition-colors hover:underline"
                >
                  {t(service.key)}
                </a>
              ))}
            </div>
          </div>

          {/* Location and Language Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-primary flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {t('location')}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground/80">
                  {currentLocation || 'Detecting location...'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground/80">
                  {isAutoMode ? 'Auto Mode' : `Language: ${i18n.language.toUpperCase()}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-primary/10 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {t('krishiSure')}. {t('allRightsReserved')}.
        </div>
      </div>
    </footer>
  );
};

export default Footer; 