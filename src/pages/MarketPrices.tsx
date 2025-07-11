import React, { useState } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Leaf } from 'lucide-react';

interface PriceRecord {
  commodity: string;
  market: string;
  state: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  date: string;
}

const commodities = ['Potato', 'Tomato', 'Onion', 'Wheat', 'Rice'];
const locations = ['Delhi Delhi', 'Kolkata West Bengal', 'Mumbai Maharashtra', 'Chennai Tamil Nadu', 'Bengaluru Karnataka'];
const soilTypes = ['Alluvial', 'Black', 'Red', 'Laterite', 'Clayey'];
const seasons = ['Rabi', 'Kharif', 'Zaid'];
const modes = ['Market Prices', 'Cross Crop Advisory'];

const dummyPrices: Record<string, PriceRecord[]> = {
  'Potato': [
    { commodity: 'Potato', market: 'Delhi Mandi', state: 'Delhi', min_price: 1200, max_price: 1500, modal_price: 1350, date: '2025-07-11' },
    { commodity: 'Potato', market: 'Kolkata Market', state: 'West Bengal', min_price: 1100, max_price: 1450, modal_price: 1300, date: '2025-07-11' },
  ],
  'Tomato': [
    { commodity: 'Tomato', market: 'Mumbai Mandi', state: 'Maharashtra', min_price: 800, max_price: 1000, modal_price: 900, date: '2025-07-11' },
    { commodity: 'Tomato', market: 'Chennai Market', state: 'Tamil Nadu', min_price: 850, max_price: 1050, modal_price: 950, date: '2025-07-11' },
  ],
  'Onion': [
    { commodity: 'Onion', market: 'Delhi Mandi', state: 'Delhi', min_price: 900, max_price: 1200, modal_price: 1050, date: '2025-07-11' },
    { commodity: 'Onion', market: 'Bengaluru Mandi', state: 'Karnataka', min_price: 950, max_price: 1250, modal_price: 1100, date: '2025-07-11' },
  ],
  'Wheat': [
    { commodity: 'Wheat', market: 'Kolkata Market', state: 'West Bengal', min_price: 1500, max_price: 1700, modal_price: 1600, date: '2025-07-11' },
    { commodity: 'Wheat', market: 'Delhi Mandi', state: 'Delhi', min_price: 1400, max_price: 1650, modal_price: 1550, date: '2025-07-11' },
  ],
  'Rice': [
    { commodity: 'Rice', market: 'Chennai Market', state: 'Tamil Nadu', min_price: 1800, max_price: 2100, modal_price: 1950, date: '2025-07-11' },
    { commodity: 'Rice', market: 'Mumbai Mandi', state: 'Maharashtra', min_price: 1750, max_price: 2050, modal_price: 1900, date: '2025-07-11' },
  ]
};

const getDummyAdvisory = (crop: string, soil: string, season: string, loc: string) => {
  return `🌱 Advisory (dummy):
• Intercrop ${crop} with legumes like Moong or Soybean.
• Soil: ${soil}, Season: ${season}
• Location: ${loc}
• Expected yield increase: 20–30%
• Tip: Ensure good drainage and spaced planting.`;
};

const MarketPrices = () => {
  const [mode, setMode] = useState(modes[0]);
  const [commodity, setCommodity] = useState(commodities[0]);
  const [location, setLocation] = useState(locations[0]);
  const [soilType, setSoilType] = useState(soilTypes[0]);
  const [season, setSeason] = useState(seasons[0]);
  const [prices, setPrices] = useState<PriceRecord[]>([]);
  const [advisory, setAdvisory] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFetch = () => {
    setLoading(true);
    setAdvisory('');
    setPrices([]);

    setTimeout(() => {
      if (mode === 'Market Prices') {
        setPrices(dummyPrices[commodity] || []);
      } else {
        setAdvisory(getDummyAdvisory(commodity, soilType, season, location));
      }
      setLoading(false);
    }, 500); // Simulate API delay
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold hero-text">{mode}</h1>
          <p className="text-muted-foreground mt-1">
            {mode === 'Market Prices'
              ? 'Fetch latest mandi prices for key crops'
              : 'Get expert cross-crop planting advice'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {mode === 'Market Prices' ? <DollarSign className="h-5 w-5 text-primary" /> : <Leaf className="h-5 w-5 text-primary" />}
          <Badge variant="outline" className="text-xs">Dummy Data</Badge>
        </div>
      </div>

      {/* Form */}
      <Card className="agri-card">
        <CardHeader>
          <CardTitle>Enter Details</CardTitle>
          <CardDescription>Choose mode, crop, location and options</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {modes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={commodity} onValueChange={setCommodity}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {commodities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>

          {mode === 'Cross Crop Advisory' && (
            <>
              <Select value={soilType} onValueChange={setSoilType}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {soilTypes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={season} onValueChange={setSeason}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {seasons.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </>
          )}

          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
            <SelectContent>
              {locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>

          <Button onClick={handleFetch} className="gradient-primary" disabled={loading}>
            {loading ? 'Loading...' : mode === 'Market Prices' ? 'Get Prices' : 'Get Advice'}
          </Button>
        </CardContent>
      </Card>

      {/* Output */}
      {mode === 'Market Prices' && prices.length > 0 && (
        <Card className="agri-card">
          <CardHeader><CardTitle>Prices for {commodity}</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th>Market</th>
                  <th>State</th>
                  <th>Min (₹)</th>
                  <th>Max (₹)</th>
                  <th>Modal (₹)</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((p, idx) => (
                  <tr key={idx}>
                    <td>{p.market}</td>
                    <td>{p.state}</td>
                    <td>{p.min_price}</td>
                    <td>{p.max_price}</td>
                    <td>{p.modal_price}</td>
                    <td>{p.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {mode === 'Cross Crop Advisory' && advisory && (
        <Card className="agri-card">
          <CardHeader>
            <CardTitle>Advisory</CardTitle>
            <CardDescription>Crop: {commodity}, Location: {location}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-muted-foreground">{advisory}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MarketPrices;
