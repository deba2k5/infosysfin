import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { satelliteService } from '@/services/satelliteService';
import { weatherService, ForecastDay } from '@/services/weatherService';

const Dashboard = () => {
  const navigate = useNavigate();

  // --- Live location and manual override state ---
  const DEFAULT_LOCATION = { lat: 18.5204, lon: 73.8567 }; // Pune, Maharashtra
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(false);
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
  const [satelliteData, setSatelliteData] = useState<any>(null);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);

  // --- Your quick actions (unchanged) ---
  const quickActions = [
    {
      title: 'Crop Health Check',
      description: 'Upload plant image for AI diagnosis',
      icon: Camera,
      action: 'diagnosis',
      image: cropDiagnosisImage,
      path: '/crop-health'
    },
    {
      title: 'Weather Forecast',
      description: '7-day satellite weather data',
      icon: CloudSun,
      action: 'weather',
      image: weatherSatelliteImage,
      path: '/weather'
    },
    {
      title: 'Market Prices',
      description: 'Current mandi rates & trends',
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
    setLoading(true);
    setError(null);
    try {
      const satellite = await satelliteService.getSatelliteData(lat, lon);
      setFarmData({
        totalArea: `${satellite.geospatialAnalysis.fieldBoundaries.reduce((sum: number, f: any) => sum + f.area, 0).toFixed(2)} hectares`,
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
      setLoading(false);
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
    setLoading(true);
    setError(null);
    const coords = await geocodePlace(placeName.trim());
    if (!coords) {
      setError('Place not found. Please try another name.');
      setLoading(false);
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
    setLoading(true);
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
      setLoading(true);
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
    const alerts: any[] = [];
    // Weather-based alerts
    forecast.forEach(day => {
      if (day.rain >= 80) {
        alerts.push({
          id: `rain-${day.day}`,
          type: 'weather',
          severity: 'high',
          message: `${day.day}: Heavy rain expected (${day.rain}%)`,
          time: 'Upcoming'
        });
      } else if (day.rain >= 50) {
        alerts.push({
          id: `rain-${day.day}`,
          type: 'weather',
          severity: 'medium',
          message: `${day.day}: Moderate rain expected (${day.rain}%)`,
          time: 'Upcoming'
        });
      }
      if (day.condition.toLowerCase().includes('storm')) {
        alerts.push({
          id: `storm-${day.day}`,
          type: 'weather',
          severity: 'high',
          message: `${day.day}: Storm expected`,
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
          message: 'Crop health is below optimal. Check for disease or stress.',
          time: 'Now'
        });
      }
      if (satelliteData.geospatialAnalysis?.healthAnalysis?.stressAreas?.length > 0) {
        satelliteData.geospatialAnalysis.healthAnalysis.stressAreas.forEach((area: any, idx: number) => {
          alerts.push({
            id: `stress-${idx}`,
            type: 'disease',
            severity: area.severity,
            message: `Stress area detected (${area.type.replace('_', ' ')}), severity: ${area.severity}`,
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold hero-text">Farm Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening on your farm today.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {location ? `Lat: ${location.lat.toFixed(4)}, Lon: ${location.lon.toFixed(4)}` : 'Fetching location...'}
          </span>
          <Badge variant="outline" className="text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            Kharif Season
          </Badge>
          {/* Manual location toggle */}
          <Button
            size="sm"
            variant="outline"
            className="ml-2"
            onClick={() => setManualMode((m) => !m)}
          >
            {manualMode ? 'Cancel' : 'Change Location'}
          </Button>
        </div>
      </div>
      {/* Manual location input */}
      {manualMode && (
        <form onSubmit={handleManualSubmit} className="flex items-center space-x-2 mb-4">
          <Input
            type="text"
            placeholder="Enter place name (e.g. Pune, Maharashtra)"
            value={placeName}
            onChange={(e) => setPlaceName(e.target.value)}
            className="w-64"
          />
          <Button type="submit" size="sm">Set Location</Button>
          <Button type="button" size="sm" variant="ghost" onClick={handleUseAuto}>
            Use My Location
          </Button>
        </form>
      )}
      {loading && (
        <div className="my-4 text-center text-blue-500">Loading live data...</div>
      )}
      {error && (
        <div className="my-4 text-center text-red-500">{error}</div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="agri-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Farm Area</CardTitle>
            <Leaf className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{farmData.totalArea}</div>
            <p className="text-xs text-muted-foreground">
              {farmData.currentCrops} active crops
            </p>
          </CardContent>
        </Card>

        <Card className="agri-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{farmData.healthScore}%</div>
            <Progress value={farmData.healthScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="agri-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temperature</CardTitle>
            <CloudSun className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{weatherData.temperature}</div>
            <p className="text-xs text-muted-foreground">{weatherData.condition}</p>
          </CardContent>
        </Card>

        <Card className="agri-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yield Prediction</CardTitle>
            <ShieldCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-agri-lime">{farmData.yieldPrediction}</div>
            <p className="text-xs text-muted-foreground">vs last season</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="agri-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
          <CardDescription>
            Essential farming tools at your fingertips
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <div key={action.action} className="relative group cursor-pointer">
                  <div 
                    className="relative h-48 rounded-xl overflow-hidden bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                    style={{ backgroundImage: `url(${action.image})` }}
                    onClick={() => handleQuickAction(action.action, action.path)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-foreground">{action.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{action.description}</p>
                      <Button 
                        size="sm" 
                        className="gradient-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickAction(action.action, action.path);
                        }}
                      >
                        Try Now
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Alerts & Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="agri-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Recent Alerts</span>
            </CardTitle>
            <CardDescription>
              Important notifications for your farm
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
              <span>Weather Overview</span>
            </CardTitle>
            <CardDescription>
              Current conditions and forecast
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Temperature</p>
                <p className="text-2xl font-bold text-primary">{weatherData.temperature}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Humidity</p>
                <p className="text-2xl font-bold text-primary">{weatherData.humidity}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Rainfall</p>
                <p className="text-2xl font-bold text-primary">{weatherData.rainfall}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Condition</p>
                <p className="text-lg font-medium text-primary">{weatherData.condition}</p>
              </div>
            </div>
            <Button 
              className="w-full mt-4 gradient-accent"
              onClick={() => navigate('/weather')}
            >
              View 7-Day Forecast
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
