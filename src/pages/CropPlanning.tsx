'use client';

import React, { useState } from 'react';
import axios from 'axios';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Leaf, MapPin, Calendar, Droplets, Thermometer,
  DollarSign, AlertCircle, CheckCircle, Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const SERPER_API_KEY = '1ed76e52b93c255cfe96f4d5a70d4aadd2952696';

const CropPlanning = () => {
  const [soilType, setSoilType] = useState('');
  const [season, setSeason] = useState('');
  const [budget, setBudget] = useState('');
  const [area, setArea] = useState('');
  const [cropRecommendations, setCropRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const weatherConditions = {
    temperature: '25-30°C',
    rainfall: '600-800mm',
    humidity: '60-70%',
    soilPh: '6.5-7.5'
  };

  const getSuitabilityColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProfitabilityColor = (level: string) => {
    switch (level) {
      case 'High': return 'text-green-400 bg-green-400/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'Low': return 'text-red-400 bg-red-400/20';
      default: return 'text-primary bg-primary/20';
    }
  };

  const extractCropNames = (text: string) => {
    const crops = text.match(/\b(?:rice|wheat|maize|barley|cotton|sugarcane|jute|millet|sorghum|soybean|chickpea|pigeonpea|tomato|potato|onion|mustard)\b/gi);
    return [...new Set(crops || [])].slice(0, 3);
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    const query = `Best crops for ${season} season in ${soilType} soil within ₹${budget} budget for ${area} hectares`;

    try {
      const res = await axios.post('https://google.serper.dev/search', {
        q: query
      }, {
        headers: {
          'X-API-KEY': SERPER_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      const snippets = res.data.organic.map((item: any) => item.snippet).join(' ');
      const crops = extractCropNames(snippets);

      const summary = crops.map((crop, index) => ({
        name: crop.charAt(0).toUpperCase() + crop.slice(1),
        suitability: 80 - index * 10,
        expectedYield: 'Based on region',
        profitability: ['High', 'Medium', 'Low'][index] || 'Medium',
        season: season,
        waterRequirement: 'Varies by soil',
        marketDemand: 'Region-dependent',
        investmentNeeded: `₹${(+budget / crops.length).toFixed(0)}/hectare`,
        pros: [`AI search suggests ${crop} is viable for your condition.`],
        cons: ['Verify with local agriculture office for accuracy.']
      }));

      setCropRecommendations(summary);
    } catch (error) {
      console.error('Serper API Error:', error);
      alert('Failed to get crop recommendations.');
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold hero-text">Crop Planning</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered crop recommendations tailored for your farm
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-primary" />
          <Badge variant="outline" className="text-xs">AI Powered</Badge>
        </div>
      </div>

      <Card className="agri-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Farm Details</span>
          </CardTitle>
          <CardDescription>
            Provide your farm details to get personalized crop recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="soil-type">Soil Type</Label>
              <Select value={soilType} onValueChange={setSoilType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select soil type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="black">Black Soil</SelectItem>
                  <SelectItem value="red">Red Soil</SelectItem>
                  <SelectItem value="alluvial">Alluvial Soil</SelectItem>
                  <SelectItem value="clay">Clay Soil</SelectItem>
                  <SelectItem value="loamy">Loamy Soil</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="season">Season</Label>
              <Select value={season} onValueChange={setSeason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select season" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kharif">Kharif (Jun-Oct)</SelectItem>
                  <SelectItem value="rabi">Rabi (Nov-Apr)</SelectItem>
                  <SelectItem value="zaid">Zaid (Apr-Jun)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Farm Area (hectares)</Label>
              <Input id="area" type="number" placeholder="5.2" value={area} onChange={(e) => setArea(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Budget (₹)</Label>
              <Input id="budget" type="number" placeholder="200000" value={budget} onChange={(e) => setBudget(e.target.value)} />
            </div>
          </div>
          <Button className="mt-4 gradient-primary" onClick={fetchRecommendations} disabled={loading}>
            {loading ? 'Fetching...' : 'Get AI Recommendations'}
          </Button>
        </CardContent>
      </Card>

      <Card className="agri-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Thermometer className="h-5 w-5" />
            <span>Current Conditions</span>
          </CardTitle>
          <CardDescription>
            Environmental factors affecting crop selection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-secondary/50">
              <Thermometer className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Temperature</p>
              <p className="font-semibold text-primary">{weatherConditions.temperature}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/50">
              <Droplets className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Rainfall</p>
              <p className="font-semibold text-primary">{weatherConditions.rainfall}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/50">
              <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Humidity</p>
              <p className="font-semibold text-primary">{weatherConditions.humidity}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/50">
              <Leaf className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Soil pH</p>
              <p className="font-semibold text-primary">{weatherConditions.soilPh}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">AI Crop Recommendations</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {cropRecommendations.map((crop, index) => (
            <Card key={index} className="agri-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Leaf className="h-5 w-5 text-primary" />
                    <span>{crop.name}</span>
                  </CardTitle>
                  <Badge className={getProfitabilityColor(crop.profitability)}>
                    {crop.profitability}
                  </Badge>
                </div>
                <CardDescription>
                  Suitability Score: {crop.suitability}%
                </CardDescription>
                <Progress value={crop.suitability} className={`h-2 ${getSuitabilityColor(crop.suitability)}`} />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Expected Yield</p>
                    <p className="font-medium">{crop.expectedYield}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Season</p>
                    <p className="font-medium">{crop.season}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Water Need</p>
                    <p className="font-medium">{crop.waterRequirement}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Market Demand</p>
                    <p className="font-medium">{crop.marketDemand}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Investment: {crop.investmentNeeded}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-green-400">Advantages:</p>
                  {crop.pros.map((pro: string, i: number) => (
                    <div key={i} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-400" />
                      <span className="text-muted-foreground">{pro}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-yellow-400">Considerations:</p>
                  {crop.cons.map((con: string, i: number) => (
                    <div key={i} className="flex items-center space-x-2 text-sm">
                      <AlertCircle className="h-3 w-3 text-yellow-400" />
                      <span className="text-muted-foreground">{con}</span>
                    </div>
                  ))}
                </div>
                <Button className="w-full gradient-primary">
                  Select This Crop
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CropPlanning;
