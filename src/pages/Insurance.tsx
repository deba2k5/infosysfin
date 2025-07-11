import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, DollarSign, FileText, Smartphone, CheckCircle } from 'lucide-react';

const Insurance = () => {
  const [cropArea, setCropArea] = useState('');
  const [cropType, setCropType] = useState('');
  const [expectedYield, setExpectedYield] = useState('');

  const insuranceSchemes = [
    {
      name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      coverage: 'Comprehensive',
      premium: '₹2,500/hectare',
      maxClaim: '₹50,000/hectare',
      features: ['Weather-based claims', 'Satellite monitoring', 'Quick settlement'],
      eligibility: 'All farmers',
      status: 'Available',
      link: 'https://pmfby.gov.in/'
    },
    {
      name: 'Weather Based Crop Insurance',
      coverage: 'Weather Events',
      premium: '₹1,800/hectare',
      maxClaim: '₹35,000/hectare',
      features: ['Automated claims', 'No crop cutting', 'Fast payout'],
      eligibility: 'Kharif crops',
      status: 'Available',
      link: 'https://www.aicofindia.com/'
    },
    {
      name: 'Coconut Palm Insurance Scheme',
      coverage: 'Tree Coverage',
      premium: '₹100/tree',
      maxClaim: '₹9,000/tree',
      features: ['Natural disasters', 'Disease coverage', '3-year validity'],
      eligibility: 'Coconut farmers',
      status: 'Seasonal',
      link: 'https://www.kerala.gov.in/documents/10180/46696/Coconut%20Palm%20Insurance%20Scheme'
    }
  ];

  const recentClaims = [
    {
      id: 'CL001',
      crop: 'Wheat',
      area: '2.5 hectares',
      reason: 'Hailstorm damage',
      amount: '₹45,000',
      status: 'Approved',
      date: '15 Oct 2024'
    },
    {
      id: 'CL002',
      crop: 'Cotton',
      area: '1.8 hectares',
      reason: 'Drought conditions',
      amount: '₹32,000',
      status: 'Under Review',
      date: '8 Oct 2024'
    }
  ];

  const microfinanceOptions = [
    {
      name: 'Kisan Credit Card (KCC)',
      amount: 'Up to ₹3,00,000',
      interest: '7% per annum',
      tenure: '5 years',
      features: ['No processing fee', 'Flexible repayment', 'Crop loan + insurance'],
      link: 'https://www.pmkisan.gov.in/KisanCreditCard.aspx'
    },
    {
      name: 'Mudra Loan - Tarun',
      amount: 'Up to ₹10,00,000',
      interest: '8.5% per annum',
      tenure: '3 years',
      features: ['Quick approval', 'Minimal documentation', 'Business expansion'],
      link: 'https://www.mudra.org.in/'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'text-green-400 bg-green-400/20';
      case 'Under Review': return 'text-yellow-400 bg-yellow-400/20';
      case 'Rejected': return 'text-red-400 bg-red-400/20';
      case 'Available': return 'text-primary bg-primary/20';
      case 'Seasonal': return 'text-blue-400 bg-blue-400/20';
      default: return 'text-muted-foreground bg-muted/20';
    }
  };

  const area = parseFloat(cropArea) || 0;
  const premiumRate = 2500;
  const maxClaimPerHectare = 50000;
  const estimatedPremium = area * premiumRate;
  const maxCoverage = area * maxClaimPerHectare;
  const savingsPercent = 25;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold hero-text">Insurance & Finance</h1>
          <p className="text-muted-foreground mt-1">Secure your crops and access financial assistance</p>
        </div>
        <div className="flex items-center space-x-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <Badge variant="outline" className="text-xs">Government Backed</Badge>
        </div>
      </div>

      <Card className="agri-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Insurance Premium Calculator</span>
          </CardTitle>
          <CardDescription>Calculate your premium (based on PMFBY)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="crop-area">Farm Area (hectares)</Label>
              <Input id="crop-area" type="number" placeholder="5.2" value={cropArea} onChange={(e) => setCropArea(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crop-type">Crop Type</Label>
              <Input id="crop-type" type="text" placeholder="Wheat" value={cropType} onChange={(e) => setCropType(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expected-yield">Expected Yield (quintal)</Label>
              <Input id="expected-yield" type="number" placeholder="250" value={expectedYield} onChange={(e) => setExpectedYield(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-secondary/50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Estimated Premium</p>
              <p className="text-2xl font-bold text-primary">₹{estimatedPremium.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Maximum Coverage</p>
              <p className="text-2xl font-bold text-primary">₹{maxCoverage.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Savings vs Market</p>
              <p className="text-2xl font-bold text-agri-lime">{savingsPercent}%</p>
            </div>
          </div>

          <Button className="mt-4 gradient-primary" onClick={() => window.open('https://pmfby.gov.in/', '_blank')}>
            Apply for Insurance
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Available Insurance Schemes</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {insuranceSchemes.map((scheme) => (
            <Card key={scheme.name} className="agri-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{scheme.name}</CardTitle>
                  <Badge className={getStatusColor(scheme.status)}>{scheme.status}</Badge>
                </div>
                <CardDescription>{scheme.coverage} Coverage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Premium</p>
                    <p className="font-semibold text-primary">{scheme.premium}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Max Claim</p>
                    <p className="font-semibold text-primary">{scheme.maxClaim}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Key Features:</p>
                  {scheme.features.map((feature, i) => (
                    <div key={i} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-400" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">Eligibility: {scheme.eligibility}</p>
                </div>
                <Button className="w-full gradient-primary" size="sm" onClick={() => window.open(scheme.link, '_blank')}>
                  Learn More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="agri-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Recent Claims</span>
            </CardTitle>
            <CardDescription>Track your insurance claim status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentClaims.map((claim) => (
              <div key={claim.id} className="p-4 rounded-lg bg-secondary/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{claim.id}</span>
                  <Badge className={getStatusColor(claim.status)}>{claim.status}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Crop</p>
                    <p className="font-medium">{claim.crop}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Area</p>
                    <p className="font-medium">{claim.area}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="font-medium text-primary">{claim.amount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-medium">{claim.date}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Reason: {claim.reason}</p>
              </div>
            ))}
            <Button className="w-full gradient-accent" onClick={() => window.open('https://pmfby.gov.in/farmerRegistrationForm', '_blank')}>
              File New Claim
            </Button>
          </CardContent>
        </Card>

        <Card className="agri-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5" />
              <span>Microfinance Options</span>
            </CardTitle>
            <CardDescription>Access credit facilities for your farm</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {microfinanceOptions.map((option) => (
              <div key={option.name} className="p-4 rounded-lg bg-secondary/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{option.name}</h4>
                  <Badge variant="outline">Available</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="font-medium text-primary">{option.amount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Interest</p>
                    <p className="font-medium text-primary">{option.interest}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tenure</p>
                    <p className="font-medium">{option.tenure}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  {option.features.map((feature, i) => (
                    <div key={i} className="flex items-center space-x-2 text-xs">
                      <CheckCircle className="h-3 w-3 text-green-400" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                <Button className="w-full gradient-earth" size="sm" onClick={() => window.open(option.link, '_blank')}>
                  Apply Now
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Insurance;
