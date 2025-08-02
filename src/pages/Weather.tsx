import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Cloud, 
    Sun, 
    CloudRain, 
    Wind, 
    Thermometer, 
    Droplets, 
    Eye, 
    Sunrise, 
    Sunset,
    RefreshCw,
    MapPin,
    Calendar,
    Clock,
    Leaf,
    Satellite,
    AlertTriangle,
    CheckCircle,
    Info,
    Navigation,
    Search,
    Globe,
    Compass
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SpeakButton from '@/components/SpeakButton';
import ReadPageButton from '@/components/ReadPageButton';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default icon for leaflet markers
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Neon text shadow class (add to global CSS if not present)
// .neon-text { text-shadow: 0 0 8px #39ff14, 0 0 16px #39ff14; }

const Weather = () => {
    const { t } = useTranslation();
    const [weatherData, setWeatherData] = useState(null);
    const [satelliteData, setSatelliteData] = useState(null);
    const [forecastData, setForecastData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentLocation, setCurrentLocation] = useState({ lat: 20.5937, lng: 78.9629 }); // Default to India center
    const [locationName, setLocationName] = useState('India');
    const [locationLoading, setLocationLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Mock data for demonstration
    useEffect(() => {
        const mockWeatherData = {
            temperature: 28,
            humidity: 65,
            windSpeed: 12,
            condition: 'Partly Cloudy',
            visibility: 10,
            sunrise: '06:30',
            sunset: '18:45',
            feelsLike: 30,
            pressure: 1013,
            uvIndex: 7
        };

        const mockSatelliteData = {
            vegetationIndex: 0.75,
            lastUpdated: new Date().toLocaleString(),
            soilMoisture: 0.68,
            cropHealth: 'Good'
        };

        const mockForecastData = [
            { day: 'Today', high: 30, low: 22, rain: 20, condition: 'Partly Cloudy', wind: 12 },
            { day: 'Tomorrow', high: 32, low: 24, rain: 10, condition: 'Sunny', wind: 8 },
            { day: 'Day 3', high: 29, low: 21, rain: 60, condition: 'Rainy', wind: 15 },
            { day: 'Day 4', high: 31, low: 23, rain: 5, condition: 'Sunny', wind: 10 },
            { day: 'Day 5', high: 28, low: 20, rain: 80, condition: 'Heavy Rain', wind: 20 },
            { day: 'Day 6', high: 27, low: 19, rain: 40, condition: 'Cloudy', wind: 12 },
            { day: 'Day 7', high: 30, low: 22, rain: 15, condition: 'Partly Cloudy', wind: 9 }
        ];

        setTimeout(() => {
            setWeatherData(mockWeatherData);
            setSatelliteData(mockSatelliteData);
            setForecastData(mockForecastData);
            setLoading(false);
        }, 1000);
    }, []);

    const getCurrentLocation = () => {
        setLocationLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCurrentLocation({ lat: latitude, lng: longitude });
                    getLocationName(latitude, longitude);
                    setLocationLoading(false);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    setLocationLoading(false);
                }
            );
        } else {
            setLocationLoading(false);
        }
    };

    const getLocationName = async (lat: number, lng: number) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
            );
            const data = await response.json();
            const address = data.address || {};
            const city = address.city || address.town || address.village || '';
            const state = address.state || '';
            setLocationName(city && state ? `${city}, ${state}` : state || 'Unknown Location');
        } catch (error) {
            console.error('Error getting location name:', error);
            setLocationName('Unknown Location');
        }
    };

    const getWeatherIcon = (condition) => {
        switch (condition.toLowerCase()) {
            case 'sunny':
                return <Sun className="h-8 w-8 text-[#39ff14] neon-text" />;
            case 'cloudy':
                return <Cloud className="h-8 w-8 text-[#39ff14] neon-text" />;
            case 'partly cloudy':
                return <Cloud className="h-8 w-8 text-[#39ff14] neon-text" />;
            case 'rainy':
                return <CloudRain className="h-8 w-8 text-[#39ff14] neon-text" />;
            case 'heavy rain':
                return <CloudRain className="h-8 w-8 text-[#39ff14] neon-text" />;
            default:
                return <Cloud className="h-8 w-8 text-[#39ff14] neon-text" />;
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity.toLowerCase()) {
            case 'high':
                return 'text-red-600 bg-red-100 dark:bg-red-900/20';
            case 'medium':
                return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
            case 'low':
                return 'text-green-600 bg-green-100 dark:bg-green-900/20';
            default:
                return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#101d12] flex items-center justify-center">
                <div className="container mx-auto p-6">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="flex items-center space-x-2 bg-[#101d12] p-4 rounded-lg shadow-lg">
                            <RefreshCw className="h-6 w-6 animate-spin text-[#39ff14] neon-text" />
                            <span className="text-lg text-[#39ff14] neon-text">{t('loading')}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#101d12] flex flex-col">
            <div className="container mx-auto p-6 space-y-6 flex-1">
                {/* Header */}
                <div className="flex items-center justify-between bg-[#101d12] p-6 rounded-lg shadow-lg border border-green-900">
                    <div>
                        <h1 className="text-3xl font-bold neon-text text-[#39ff14] flex items-center gap-2">
                            <Cloud className="h-8 w-8 text-[#39ff14] neon-text" />
                            {t('weather')} <SpeakButton textKey="weather" />
                        </h1>
                        <p className="text-[#39ff14] neon-text mt-2">
                            {t('satelliteWeatherData')}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ReadPageButton text={t('weather')} />
                    </div>
                </div>

                {/* Location and Search */}
                <Card className="bg-[#101d12] border border-green-900 shadow-lg">
                    <CardHeader className="bg-[#101d12] border-b border-green-900">
                        <CardTitle className="flex items-center gap-2 text-[#39ff14] neon-text">
                            <MapPin className="h-5 w-5 text-[#39ff14] neon-text" />
                            {t('location')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <Label htmlFor="search" className="text-[#39ff14] neon-text">{t('searchLocation')}</Label>
                                <div className="flex gap-2 mt-1">
                                    <Input
                                        id="search"
                                        placeholder={t('enterCityOrLocation')}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="border-green-400 focus:border-[#39ff14] focus:ring-[#39ff14] bg-[#101d12] text-[#39ff14] neon-text"
                                    />
                                    <Button size="sm" className="bg-[#39ff14] text-[#101d12] hover:bg-green-400">
                                        <Search className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Button
                                    variant="outline"
                                    onClick={getCurrentLocation}
                                    disabled={locationLoading}
                                    className="whitespace-nowrap border-green-400 text-[#39ff14] neon-text hover:bg-green-900/20"
                                >
                                    {locationLoading ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                                            {t('gettingLocation')}
                                        </>
                                    ) : (
                                        <>
                                            <Navigation className="h-4 w-4 mr-2" />
                                            {t('getCurrentLocation')}
                                        </>
                                    )}
                                </Button>
                                <div className="text-sm text-[#39ff14] neon-text text-center">
                                    {locationName}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Tabs defaultValue="current" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 bg-[#101d12] border border-green-900">
                        <TabsTrigger value="current" className="data-[state=active]:bg-[#39ff14] data-[state=active]:text-[#101d12] neon-text">{
                            t('currentWeather')}</TabsTrigger>
                        <TabsTrigger value="forecast" className="data-[state=active]:bg-[#39ff14] data-[state=active]:text-[#101d12] neon-text">{
                            t('sevenDayForecast')}</TabsTrigger>
                        <TabsTrigger value="satellite" className="data-[state=active]:bg-[#39ff14] data-[state=active]:text-[#101d12] neon-text">{
                            t('satelliteData')}</TabsTrigger>
                        <TabsTrigger value="map" className="data-[state=active]:bg-[#39ff14] data-[state=active]:text-[#101d12] neon-text">{
                            t('weatherMap')}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="current" className="space-y-6">
                        {/* Current Weather */}
                        <Card className="bg-[#101d12] border border-green-900 shadow-lg">
                            <CardHeader className="bg-[#101d12] border-b border-green-900">
                                <CardTitle className="flex items-center gap-2 text-[#39ff14] neon-text">
                                    <Thermometer className="h-5 w-5 text-[#39ff14] neon-text" />
                                    {t('currentWeather')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {weatherData ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="flex items-center space-x-3 p-4 bg-[#101d12] rounded-lg border border-green-900">
                                            <Thermometer className="h-6 w-6 text-[#39ff14] neon-text" />
                                            <div>
                                                <p className="text-sm text-[#39ff14] neon-text">{t('temperature')}</p>
                                                <p className="text-xl font-semibold text-[#39ff14] neon-text">{weatherData.temperature}°C</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3 p-4 bg-[#101d12] rounded-lg border border-green-900">
                                            <Droplets className="h-6 w-6 text-[#39ff14] neon-text" />
                                            <div>
                                                <p className="text-sm text-[#39ff14] neon-text">{t('humidity')}</p>
                                                <p className="text-xl font-semibold text-[#39ff14] neon-text">{weatherData.humidity}%</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3 p-4 bg-[#101d12] rounded-lg border border-green-900">
                                            <Wind className="h-6 w-6 text-[#39ff14] neon-text" />
                                            <div>
                                                <p className="text-sm text-[#39ff14] neon-text">{t('windSpeed')}</p>
                                                <p className="text-xl font-semibold text-[#39ff14] neon-text">{weatherData.windSpeed} km/h</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3 p-4 bg-[#101d12] rounded-lg border border-green-900">
                                            <Eye className="h-6 w-6 text-[#39ff14] neon-text" />
                                            <div>
                                                <p className="text-sm text-[#39ff14] neon-text">{t('visibility')}</p>
                                                <p className="text-xl font-semibold text-[#39ff14] neon-text">{weatherData.visibility} km</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-[#39ff14] neon-text">{t('noWeatherData')}</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Weather Alerts */}
                        <Card className="bg-[#101d12] border border-green-900 shadow-lg">
                            <CardHeader className="bg-[#101d12] border-b border-green-900">
                                <CardTitle className="flex items-center gap-2 text-[#39ff14] neon-text">
                                    <AlertTriangle className="h-5 w-5 text-[#39ff14] neon-text" />
                                    {t('recentAlerts')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <Alert className="border-green-700 bg-[#101d12]">
                                        <AlertTriangle className="h-4 w-4 text-[#39ff14] neon-text" />
                                        <AlertDescription className="text-[#39ff14] neon-text">
                                            <strong>{t('heavyRainfallAlert')}</strong> - {t('heavyRainfallMessage')}
                                        </AlertDescription>
                                    </Alert>
                                    <Alert className="border-green-700 bg-[#101d12]">
                                        <Info className="h-4 w-4 text-[#39ff14] neon-text" />
                                        <AlertDescription className="text-[#39ff14] neon-text">
                                            <strong>{t('optimalIrrigationTime')}</strong> - {t('optimalIrrigationMessage')}
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="forecast" className="space-y-6">
                        {/* 7-Day Forecast */}
                        <Card className="bg-[#101d12] border border-green-900 shadow-lg">
                            <CardHeader className="bg-[#101d12] border-b border-green-900">
                                <CardTitle className="flex items-center gap-2 text-[#39ff14] neon-text">
                                    <Calendar className="h-5 w-5 text-[#39ff14] neon-text" />
                                    {t('sevenDayForecast')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {forecastData.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                                        {forecastData.map((day, index) => (
                                            <div key={index} className="text-center p-4 bg-[#101d12] rounded-lg border border-green-900">
                                                <p className="font-semibold text-sm mb-2 text-[#39ff14] neon-text">{day.day}</p>
                                                <div className="flex justify-center mb-2">
                                                    {getWeatherIcon(day.condition)}
                                                </div>
                                                <p className="text-lg font-bold text-[#39ff14] neon-text">{day.high}°</p>
                                                <p className="text-sm text-[#39ff14] neon-text">{day.low}°</p>
                                                <div className="flex items-center justify-center mt-2">
                                                    <CloudRain className="h-4 w-4 text-[#39ff14] neon-text mr-1" />
                                                    <span className="text-xs text-[#39ff14] neon-text">{day.rain}%</span>
                                                </div>
                                                <div className="flex items-center justify-center mt-1">
                                                    <Wind className="h-3 w-3 text-[#39ff14] neon-text mr-1" />
                                                    <span className="text-xs text-[#39ff14] neon-text">{day.wind} km/h</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[#39ff14] neon-text">{t('noForecastData')}</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="satellite" className="space-y-6">
                        {/* Satellite Data */}
                        <Card className="bg-[#101d12] border border-green-900 shadow-lg">
                            <CardHeader className="bg-[#101d12] border-b border-green-900">
                                <CardTitle className="flex items-center gap-2 text-[#39ff14] neon-text">
                                    <Satellite className="h-5 w-5 text-[#39ff14] neon-text" />
                                    {t('satelliteData')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {satelliteData ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="flex items-center space-x-3 p-4 bg-[#101d12] rounded-lg border border-green-900">
                                            <Leaf className="h-6 w-6 text-[#39ff14] neon-text" />
                                            <div>
                                                <p className="text-sm text-[#39ff14] neon-text">{t('vegetationIndex')}</p>
                                                <p className="text-xl font-semibold text-[#39ff14] neon-text">{satelliteData.vegetationIndex}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3 p-4 bg-[#101d12] rounded-lg border border-green-900">
                                            <Droplets className="h-6 w-6 text-[#39ff14] neon-text" />
                                            <div>
                                                <p className="text-sm text-[#39ff14] neon-text">{t('soilMoisture')}</p>
                                                <p className="text-xl font-semibold text-[#39ff14] neon-text">{satelliteData.soilMoisture}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3 p-4 bg-[#101d12] rounded-lg border border-green-900">
                                            <Leaf className="h-6 w-6 text-[#39ff14] neon-text" />
                                            <div>
                                                <p className="text-sm text-[#39ff14] neon-text">{t('cropHealth')}</p>
                                                <p className="text-xl font-semibold text-[#39ff14] neon-text">{satelliteData.cropHealth}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3 p-4 bg-[#101d12] rounded-lg border border-green-900">
                                            <Clock className="h-6 w-6 text-[#39ff14] neon-text" />
                                            <div>
                                                <p className="text-sm text-[#39ff14] neon-text">{t('lastUpdated')}</p>
                                                <p className="text-sm font-semibold text-[#39ff14] neon-text">{satelliteData.lastUpdated}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-[#39ff14] neon-text">{t('noSatelliteData')}</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Optimal Times */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="bg-[#101d12] border border-green-900 shadow-lg">
                                <CardHeader className="bg-[#101d12] border-b border-green-900">
                                    <CardTitle className="flex items-center gap-2 text-[#39ff14] neon-text">
                                        <CheckCircle className="h-5 w-5 text-[#39ff14] neon-text" />
                                        {t('optimalHarvestTimeCard')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-[#101d12] rounded-lg border border-green-900">
                                            <span className="font-medium text-[#39ff14] neon-text">{t('readyForHarvest')}</span>
                                            <Badge variant="outline" className="bg-green-900 text-[#39ff14] border-green-400">
                                                {t('high')}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-[#39ff14] neon-text">
                                            {t('optimalHarvestTime', { time: 'Next 3-5 days' })}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-[#101d12] border border-green-900 shadow-lg">
                                <CardHeader className="bg-[#101d12] border-b border-green-900">
                                    <CardTitle className="flex items-center gap-2 text-[#39ff14] neon-text">
                                        <Droplets className="h-5 w-5 text-[#39ff14] neon-text" />
                                        {t('optimalIrrigationTimeCard')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-[#101d12] rounded-lg border border-green-900">
                                            <span className="font-medium text-[#39ff14] neon-text">{t('optimalIrrigationTime')}</span>
                                            <Badge variant="outline" className="bg-green-900 text-[#39ff14] border-green-400">
                                                {t('medium')}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-[#39ff14] neon-text">
                                            {t('optimalIrrigationTimeValue', { time: 'Early morning' })}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="map" className="space-y-6">
                        {/* Interactive Weather Map */}
                        <Card className="bg-[#101d12] border border-green-900 shadow-lg">
                            <CardHeader className="bg-[#101d12] border-b border-green-900">
                                <CardTitle className="flex items-center gap-2 text-[#39ff14] neon-text">
                                    <Globe className="h-5 w-5 text-[#39ff14] neon-text" />
                                    {t('weatherMap')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="h-96 rounded-lg bg-[#101d12] flex items-center justify-center relative overflow-hidden border border-green-900">
                                    {/* Only render MapContainer on client side to avoid SSR issues */}
                                    {typeof window !== 'undefined' && (
                                        <MapContainer
                                            // @ts-ignore
                                            center={[currentLocation.lat, currentLocation.lng]}
                                            zoom={10}
                                            scrollWheelZoom={true}
                                            style={{ height: '100%', width: '100%', minHeight: '350px', borderRadius: '0.5rem' }}
                                        >
                                            <TileLayer
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            <Marker position={[currentLocation.lat, currentLocation.lng]}>
                                                <Popup>
                                                    <div className="text-[#39ff14] neon-text">
                                                        <div><strong>{locationName}</strong></div>
                                                        {weatherData && (
                                                            <div>
                                                                <div>{t('temperature')}: {weatherData.temperature}&deg;C</div>
                                                                <div>{t('condition')}: {weatherData.condition}</div>
                                                                <div>{t('humidity')}: {weatherData.humidity}%</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        </MapContainer>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default Weather;
