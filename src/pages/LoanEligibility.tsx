import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SpeakButton from '@/components/SpeakButton';
import { neuralProphetService, LoanEligibilityInput, LoanEligibilityOutput } from '../services/neuralProphetService';
import { weatherService } from '../services/weatherService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calculator, 
  MapPin, 
  Leaf, 
  Thermometer, 
  Droplets, 
  User, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Info,
  BarChart3,
  Shield,
  Target,
  Clock,
  Navigation
} from 'lucide-react';

const defaultInput: LoanEligibilityInput = {
  farmerId: '',
  landCoordinates: { lat: 0, lon: 0 },
  landSize: 1,
  cropType: 'rice',
  historicalData: [],
  currentSoilHealth: {
    nitrogen: 100,
    phosphorus: 80,
    potassium: 120,
    ph: 6.5,
    organic_matter: 2.5,
  },
  currentWeather: {
    temperature: 28,
    rainfall: 120,
    humidity: 60,
  },
  farmerProfile: {
    experience_years: 5,
    previous_loans: 2,
    repayment_history: 'good',
  },
};

export default function LoanEligibilityPage() {
  const [input, setInput] = useState<LoanEligibilityInput>(defaultInput);
  const [output, setOutput] = useState<LoanEligibilityOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const { t } = useTranslation();

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    try {
      // If no historical data, fetch sample
      let inputData = input;
      if (!input.historicalData.length) {
        inputData = {
          ...input,
          historicalData: await neuralProphetService.getSampleHistoricalData(
            input.landCoordinates.lat,
            input.landCoordinates.lon,
            input.cropType
          ),
        };
      }
      const result = await neuralProphetService.predictLoanEligibility(inputData);
      setOutput(result);
    } catch (e: any) {
      setError(e.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getClimateScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError(t('geolocationNotSupported'));
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        setInput({
          ...input,
          landCoordinates: newCoords,
        });
        setLocationLoading(false);
        // Get address and weather from coordinates
        getAddressFromCoords(newCoords.lat, newCoords.lon);
        fetchWeatherData(newCoords.lat, newCoords.lon);
      },
      (error) => {
        let errorMessage = t('failedToGetLocation');
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = t('locationPermissionDenied');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = t('locationUnavailable');
            break;
          case error.TIMEOUT:
            errorMessage = t('locationTimeout');
            break;
        }
        setLocationError(errorMessage);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const getAddressFromCoords = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`
      );
      const data = await response.json();
      if (data.display_name) {
        setAddress(data.display_name);
      }
    } catch (error) {
      console.log('Could not fetch address:', error);
    }
  };

  const fetchWeatherData = async (lat: number, lon: number) => {
    setWeatherLoading(true);
    try {
      const weather = await weatherService.getCurrentWeather(lat, lon);
      setWeatherData(weather);
      
      // Update input with current weather data
      setInput(prev => ({
        ...prev,
        currentWeather: {
          temperature: weather.temperature,
          rainfall: weather.condition.toLowerCase().includes('rain') ? 120 : 50,
          humidity: weather.humidity,
        },
      }));
    } catch (error) {
      console.log('Could not fetch weather data:', error);
    } finally {
      setWeatherLoading(false);
    }
  };

  // Auto-get location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Calculator className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold flex items-center gap-2">{t('loanEligibility')} <SpeakButton textKey="loanEligibility" /></h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">{t('checkLoanEligibility')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>{t('farmerInformation')}</span>
              </CardTitle>
              <CardDescription>{t('enterDetailsToPredict')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="farmerId">{t('farmerId')}</Label>
                <Input
                  id="farmerId"
                  placeholder={t('enterYourFarmerId')}
                  value={input.farmerId}
                  onChange={e => setInput({ ...input, farmerId: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{t('landCoordinates')}</span>
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder={t('latitude')}
                    value={input.landCoordinates.lat}
                    onChange={e => setInput({ 
                      ...input, 
                      landCoordinates: { ...input.landCoordinates, lat: Number(e.target.value) } 
                    })}
                  />
                  <Input
                    type="number"
                    placeholder={t('longitude')}
                    value={input.landCoordinates.lon}
                    onChange={e => setInput({ 
                      ...input, 
                      landCoordinates: { ...input.landCoordinates, lon: Number(e.target.value) } 
                    })}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  className="w-full"
                >
                  {locationLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      {t('gettingLocation')}
                    </>
                  ) : (
                    <>
                      <Navigation className="h-4 w-4 mr-2" />
                      {t('getCurrentLocation')}
                    </>
                  )}
                </Button>
                {locationError && (
                  <Alert variant="destructive" className="text-xs">
                    <AlertTriangle className="h-3 w-3" />
                    <AlertDescription>{locationError}</AlertDescription>
                  </Alert>
                )}
                {weatherLoading && (
                  <Alert className="text-xs">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
                    <AlertDescription>{t('fetchingWeatherData')}</AlertDescription>
                  </Alert>
                )}
                {input.landCoordinates.lat !== 0 && input.landCoordinates.lon !== 0 && (
                  <Alert className="text-xs">
                    <CheckCircle className="h-3 w-3" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <div>{t('coordinates')}: {input.landCoordinates.lat.toFixed(6)}, {input.landCoordinates.lon.toFixed(6)}</div>
                        {address && (
                          <div className="text-muted-foreground text-xs">
                            {t('address')}: {address}
                          </div>
                        )}
                        {weatherData && (
                          <div className="text-muted-foreground text-xs">
                            {t('weather')}: {weatherData.temperature}°C, {weatherData.condition}, {weatherData.humidity}% {t('humidity')}
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="landSize">{t('landSize')}</Label>
                <Input
                  id="landSize"
                  type="number"
                  placeholder={t('landSizeInHectares')}
                  value={input.landSize}
                  onChange={e => setInput({ ...input, landSize: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cropType">{t('cropType')}</Label>
                <Select value={input.cropType} onValueChange={(value) => setInput({ ...input, cropType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectCropType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rice">{t('rice')}</SelectItem>
                    <SelectItem value="wheat">{t('wheat')}</SelectItem>
                    <SelectItem value="maize">{t('maize')}</SelectItem>
                    <SelectItem value="cotton">{t('cotton')}</SelectItem>
                    <SelectItem value="sugarcane">{t('sugarcane')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handlePredict} 
                className="w-full" 
                disabled={loading || !input.farmerId}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('analyzing')}
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    {t('predictLoanEligibility')}
                  </>
                )}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : output ? (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
                <TabsTrigger value="details">{t('details')}</TabsTrigger>
                <TabsTrigger value="analysis">{t('analysis')}</TabsTrigger>
                <TabsTrigger value="metrics">{t('metrics')}</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {/* Eligibility Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{t('loanEligibilityStatus')}</span>
                      <Badge 
                        variant={output.loanEligibility.eligible ? "default" : "secondary"}
                        className={output.loanEligibility.eligible ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                      >
                        {output.loanEligibility.eligible ? t('eligible') : t('notEligible')}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getClimateScoreColor(output.climateScore)}`}>
                          {output.climateScore}
                        </div>
                        <div className="text-sm text-muted-foreground">{t('climateScore')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          ₹{output.loanEligibility.maxLoanAmount.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">{t('maxLoanAmount')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {output.loanEligibility.interestRate}%
                        </div>
                        <div className="text-sm text-muted-foreground">{t('interestRate')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {output.loanEligibility.tenure_months}
                        </div>
                        <div className="text-sm text-muted-foreground">{t('tenure')}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Risk Assessment */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>{t('riskAssessment')}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>{t('riskTier')}</span>
                      <Badge className={getRiskColor(output.riskTier)}>
                        {output.riskTier} {t('risk')}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{t('yieldProjection')}</span>
                        <span className="font-medium">{output.yieldProjection.kg_per_ha} {t('kgPerHa')}</span>
                      </div>
                      <Progress value={Math.min(100, (output.yieldProjection.kg_per_ha / 5000) * 100)} />
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('recommendedActions')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {output.explainability.recommendations.slice(0, 3).map((rec, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                {/* Loan Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('loanDetails')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t('recommendedAmount')}</Label>
                        <div className="text-2xl font-bold text-green-600">
                          ₹{output.loanEligibility.recommendedAmount.toLocaleString()}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>{t('interestSubsidy')}</Label>
                        <div className="text-2xl font-bold text-blue-600">
                          {output.loanEligibility.interestSubsidy}%
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label>{t('yieldConfidenceInterval')}</Label>
                      <div className="text-sm text-muted-foreground">
                        {output.yieldProjection.confidence_interval.lower} - {output.yieldProjection.confidence_interval.upper} {t('kgPerHa')}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Crop Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Leaf className="h-5 w-5" />
                      <span>{t('cropRecommendations')}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>{t('primaryCrop')}</Label>
                        <div className="text-lg font-semibold capitalize">{output.cropRecommendation.primaryCrop}</div>
                      </div>
                      <div>
                        <Label>{t('marketDemand')}</Label>
                        <Badge variant="outline" className="capitalize">
                          {output.cropRecommendation.marketDemand}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label>{t('alternativeCrops')}</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {output.cropRecommendation.alternativeCrops.map((crop, index) => (
                          <Badge key={index} variant="secondary" className="capitalize">
                            {crop}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4">
                {/* Factors Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('factorsAnalysis')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="flex items-center space-x-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>{t('positiveFactors')}</span>
                        </Label>
                        <ul className="mt-2 space-y-1">
                          {output.explainability.factors.positive.map((factor, index) => (
                            <li key={index} className="text-sm flex items-center space-x-2">
                              <div className="w-1 h-1 bg-green-600 rounded-full"></div>
                              <span>{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <Label className="flex items-center space-x-2 text-red-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span>{t('negativeFactors')}</span>
                        </Label>
                        <ul className="mt-2 space-y-1">
                          {output.explainability.factors.negative.map((factor, index) => (
                            <li key={index} className="text-sm flex items-center space-x-2">
                              <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                              <span>{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <Label className="flex items-center space-x-2 text-orange-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{t('riskFactors')}</span>
                      </Label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {output.explainability.riskFactors.map((factor, index) => (
                          <Badge key={index} variant="outline" className="text-orange-600 border-orange-200">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="metrics" className="space-y-4">
                {/* NeuralProphet Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>{t('neuralProphetMetrics')}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {output.neuralProphetMetrics.trend_strength.toFixed(1)}
                        </div>
                        <div className="text-sm text-muted-foreground">{t('trendStrength')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {output.neuralProphetMetrics.seasonality_strength.toFixed(1)}
                        </div>
                        <div className="text-sm text-muted-foreground">{t('seasonalityStrength')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {output.neuralProphetMetrics.forecast_accuracy.toFixed(1)}
                        </div>
                        <div className="text-sm text-muted-foreground">{t('forecastAccuracy')}</div>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <Label>{t('externalRegressorImportance')}</Label>
                      <div className="mt-2 space-y-2">
                        {Object.entries(output.neuralProphetMetrics.external_regressor_importance).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-sm capitalize">{key}</span>
                            <div className="flex items-center space-x-2">
                              <Progress value={value * 100} className="w-20" />
                              <span className="text-sm font-medium">{(value * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('noPredictionYet')}</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  {t('enterFarmerInfoAndClickPredict')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
