import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  Leaf, 
  TrendingUp, 
  AlertTriangle, 
  CloudSun, 
  ShieldCheck,
  Calendar,
  MapPin,
  Camera,
  DollarSign,
  Users
} from 'lucide-react';
import cropDiagnosisImage from '@/assets/crop-diagnosis.jpg';
import weatherSatelliteImage from '@/assets/weather-satellite.jpg';
import farmerTechImage from '@/assets/farmer-tech.jpg';
import { satelliteService, SatelliteData } from '@/services/satelliteService';
import { weatherService, ForecastDay } from '@/services/weatherService';
import { useTranslation } from 'react-i18next';
import SpeakButton from '@/components/SpeakButton';
import ReadPageButton from '@/components/ReadPageButton';
import AuthDebug from '@/components/AuthDebug';

// Define DashboardAlert type for alerts
interface DashboardAlert {
  id: string;
  type: 'weather' | 'disease';
  severity: 'low' | 'medium' | 'high';
  message: string;
  time: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { t } = useTranslation();

  // --- Live location and manual override state ---
  const DEFAULT_LOCATION = { lat: 18.5204, lon: 73.8567 }; // Pune, Maharashtra
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [placeName, setPlaceName] = useState('');
  const [usingManual, setUsingManual] = useState(false);

  // --- Weather, farm, satellite, and alerts state ---
  const [weatherData, setWeatherData] = useState({
    temperature: '28°C',
    humidity: '65%',
    rainfall: '12mm',
    condition: 'Partly Cloudy'
  });

  const [farmData, setFarmData] = useState({
    totalArea: '5.2 hectares',
    currentCrops: 3,
    healthScore: 85,
    yieldPrediction: '+23%'
  });

  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [satelliteData, setSatelliteData] = useState<SatelliteData | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<DashboardAlert[]>([]);



  // --- Your quick actions (unchanged) ---
  const quickActions = [
    {
      title: t('cropHealthCheck'),
      description: t('uploadPlantImage'),
      icon: Camera,
      action: 'diagnosis',
      image: cropDiagnosisImage,
      path: '/crop-health'
    },
    {
      title: t('weatherForecast'),
      description: t('satelliteWeatherData'),
      icon: CloudSun,
      action: 'weather',
      image: weatherSatelliteImage,
      path: '/weather'
    },
    {
      title: t('marketPrices'),
      description: t('currentMandiRates'),
      icon: DollarSign,
      action: 'market',
      image: farmerTechImage,
      path: '/market-prices'
    }
  ];

  // --- Fetch real-time weather data on location change ---
  useEffect(() => {
    if (location) {
      (async () => {
        try {
          const weather = await weatherService.getCurrentWeather(location.lat, location.lon);
          setWeatherData(prev => ({
            temperature: `${weather.temperature}°C`,
            humidity: `${weather.humidity}%`,
            rainfall: forecast[0]?.rain !== undefined ? `${forecast[0].rain}mm` : 'N/A',
            condition: weather.condition
          }));
        } catch {
          setWeatherData({
            temperature: '28°C',
            humidity: '65%',
            rainfall: '12mm',
            condition: 'Partly Cloudy'
          });
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, forecast]);

  // --- Fetch satellite data and farm metrics ---
  const fetchData = async (lat: number, lon: number) => {
    setDataLoading(true);
    setError(null);
    try {
      const satellite = await satelliteService.getSatelliteData(lat, lon);
      setFarmData({
        totalArea: `${satellite.geospatialAnalysis.fieldBoundaries.reduce((sum: number, f) => sum + f.area, 0).toFixed(2)} hectares`,
        currentCrops: satellite.geospatialAnalysis.cropClassification.length,
        healthScore: satellite.geospatialAnalysis.healthAnalysis.overallHealth,
        yieldPrediction: `+${(satellite.vegetationIndex * 100).toFixed(0)}%`
      });
      // Do not set weatherData here; it's handled by the real-time effect above
    } catch (err) {
      setError('Failed to fetch live satellite or weather data. Showing default values.');
      setFarmData({
        totalArea: '5.2 hectares',
        currentCrops: 3,
        healthScore: 85,
        yieldPrediction: '+23%'
      });
      setWeatherData({
        temperature: '28°C',
        humidity: '65%',
        rainfall: '12mm',
        condition: 'Partly Cloudy'
      });
    } finally {
      setDataLoading(false);
    }
  };

  // --- Geocode place name to coordinates ---
  const geocodePlace = async (name: string): Promise<{ lat: number; lon: number } | null> => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(name)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      }
      return null;
    } catch {
      return null;
    }
  };

  // --- Handle manual place submit ---
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placeName.trim()) {
      setError('Please enter a place name.');
      return;
    }
    setDataLoading(true);
    setError(null);
    const coords = await geocodePlace(placeName.trim());
    if (!coords) {
      setError('Place not found. Please try another name.');
      setDataLoading(false);
      return;
    }
    setLocation(coords);
    setUsingManual(true);
    setManualMode(false);
    fetchData(coords.lat, coords.lon);
  };

  // --- Switch back to automatic location ---
  const handleUseAuto = () => {
    setUsingManual(false);
    setPlaceName('');
    setManualMode(false);
    setDataLoading(true);
    setError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          if (
            !lat || !lon ||
            lat < -90 || lat > 90 ||
            lon < -180 || lon > 180
          ) {
            setLocation(DEFAULT_LOCATION);
            fetchData(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon);
          } else {
            setLocation({ lat, lon });
            fetchData(lat, lon);
          }
        },
        () => {
          setError('Unable to access your location. Showing default location.');
          setLocation(DEFAULT_LOCATION);
          fetchData(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser. Showing default location.');
      setLocation(DEFAULT_LOCATION);
      fetchData(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon);
    }
  };

  // --- On mount: get location (auto/manual) ---
  useEffect(() => {
    if (!usingManual) {
      setDataLoading(true);
      setError(null);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            if (
              !lat || !lon ||
              lat < -90 || lat > 90 ||
              lon < -180 || lon > 180
            ) {
              setLocation(DEFAULT_LOCATION);
              fetchData(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon);
            } else {
              setLocation({ lat, lon });
              fetchData(lat, lon);
            }
          },
          () => {
            setError('Unable to access your location. Showing default location.');
            setLocation(DEFAULT_LOCATION);
            fetchData(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon);
          }
        );
      } else {
        setError('Geolocation is not supported by your browser. Showing default location.');
        setLocation(DEFAULT_LOCATION);
        fetchData(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usingManual]);

  // --- Fetch 7-day forecast on location change ---
  useEffect(() => {
    if (location) {
      (async () => {
        const forecastData = await weatherService.getWeatherForecast(location.lat, location.lon);
        setForecast(forecastData);
      })();
    }
  }, [location]);

  // --- Fetch satellite data on location change ---
  useEffect(() => {
    if (location) {
      (async () => {
        const data = await satelliteService.getSatelliteData(location.lat, location.lon);
        setSatelliteData(data);
      })();
    }
  }, [location]);

  // --- Generate live recent alerts from forecast and satellite data ---
  useEffect(() => {
    const alerts: DashboardAlert[] = [];
    // Weather-based alerts
    forecast.forEach(day => {
      if (day.rain >= 80) {
        alerts.push({
          id: `rain-${day.day}`,
          type: 'weather',
          severity: 'high',
          message: `${day.day}: ${t('heavy_rain_expected', { rain: day.rain })}`,
          time: 'Upcoming'
        });
      } else if (day.rain >= 50) {
        alerts.push({
          id: `rain-${day.day}`,
          type: 'weather',
          severity: 'medium',
          message: `${day.day}: ${t('moderate_rain_expected', { rain: day.rain })}`,
          time: 'Upcoming'
        });
      }
      if (day.condition.toLowerCase().includes('storm')) {
        alerts.push({
          id: `storm-${day.day}`,
          type: 'weather',
          severity: 'high',
          message: `${day.day}: ${t('storm_expected')}`,
          time: 'Upcoming'
        });
      }
    });
    // Satellite-based alerts
    if (satelliteData) {
      if (satelliteData.cropHealth < 70) {
        alerts.push({
          id: 'crop-health',
          type: 'disease',
          severity: 'medium',
          message: t('crop_health_below_optimal'),
          time: 'Now'
        });
      }
      if (satelliteData.geospatialAnalysis?.healthAnalysis?.stressAreas?.length > 0) {
        satelliteData.geospatialAnalysis.healthAnalysis.stressAreas.forEach((area, idx) => {
          alerts.push({
            id: `stress-${idx}`,
            type: 'disease',
            severity: area.severity,
            message: `${t('stress_area_detected', { type: area.type.replace('_', ' ') })} (${t('severity')}: ${area.severity})`,
            time: 'Now'
          });
        });
      }
    }
    setRecentAlerts(alerts);
  }, [forecast, satelliteData]);

  // --- Severity color helper ---
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'low': return 'text-green-400 bg-green-400/20';
      default: return 'text-primary bg-primary/20';
    }
  };

  // --- Quick action handler (unchanged) ---
  const handleQuickAction = (action: string, path: string) => {
    navigate(path);
  };

  // Place the loading check here, after all hooks
  if (loading) return null;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* <AuthDebug /> */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="flex items-center gap-2">
          <Leaf className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold flex items-center gap-2">{t('dashboard')} <SpeakButton textKey="dashboard" /></h1>
        </div>
        <ReadPageButton text={t('dashboardPageReadout')} />
      </div>
      {/* Manual location input */}
      {manualMode && (
        <form onSubmit={handleManualSubmit} className="flex items-center space-x-2 mb-4">
          <Input
            type="text"
            placeholder={t('enterPlaceName', { example: 'Pune, Maharashtra' })}
            value={placeName}
            onChange={(e) => setPlaceName(e.target.value)}
            className="w-64"
          />
          <Button type="submit" size="sm">{t('setLocation')}</Button>
          <Button type="button" size="sm" variant="ghost" onClick={handleUseAuto}>
            {t('useMyLocation')}
          </Button>
        </form>
      )}
      {dataLoading && (
        <div className="my-4 text-center text-blue-500">{t('loadingLiveData')}</div>
      )}
      {error && (
        <div className="my-4 text-center text-red-500">{error}</div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="agri-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('farmArea')}</CardTitle>
            <Leaf className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{farmData.totalArea}</div>
            <p className="text-xs text-muted-foreground">
              {t('activeCrops', { count: farmData.currentCrops })}
            </p>
          </CardContent>
        </Card>

        <Card className="agri-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('healthScore')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{farmData.healthScore}%</div>
            <Progress value={farmData.healthScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="agri-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('temperature')}</CardTitle>
            <CloudSun className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{weatherData.temperature}</div>
            <p className="text-xs text-muted-foreground">{weatherData.condition}</p>
          </CardContent>
        </Card>

        <Card className="agri-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('yieldPrediction')}</CardTitle>
            <ShieldCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-agri-lime">{farmData.yieldPrediction}</div>
            <p className="text-xs text-muted-foreground">{t('vsLastSeason')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="agri-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>{t('quick_actions')}</span>
          </CardTitle>
          <CardDescription>
            {t('essentialFarmingTools')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, idx) => (
              <Card key={idx} className="flex flex-col h-full">
                <CardHeader className="flex flex-row items-center gap-2">
                  <action.icon className="h-6 w-6 text-primary" />
                  <CardTitle>{action.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <img src={action.image} alt={action.title} className="rounded-lg mb-2 w-full h-32 object-cover" />
                  <CardDescription>{action.description}</CardDescription>
                  <Button className="mt-4 w-full" onClick={() => navigate(action.path)}>{t('tryNow')}</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Alerts & Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="agri-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>{t('recent_alerts')}</span>
            </CardTitle>
            <CardDescription>
              {t('importantNotifications')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg bg-secondary/50">
                <Badge className={`${getSeverityColor(alert.severity)} border-0`}>
                  {alert.severity}
                </Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="agri-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CloudSun className="h-5 w-5" />
              <span>{t('weather_overview')}</span>
            </CardTitle>
            <CardDescription>
              {t('currentConditionsAndForecast')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{t('temperature')}</p>
                <p className="text-2xl font-bold text-primary">{weatherData.temperature}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{t('humidity')}</p>
                <p className="text-2xl font-bold text-primary">{weatherData.humidity}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{t('rainfall')}</p>
                <p className="text-2xl font-bold text-primary">{weatherData.rainfall}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{t('condition')}</p>
                <p className="text-lg font-medium text-primary">{weatherData.condition}</p>
              </div>
            </div>
            <Button 
              className="w-full mt-4 gradient-accent"
              onClick={() => navigate('/weather')}
            >
              {t('view7DayForecast')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

