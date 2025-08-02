'use client';

import React, { useState } from 'react';
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
  ShieldCheck, Calculator, FileText, DollarSign, TrendingUp,
  AlertCircle, CheckCircle, XCircle, Brain, Phone, MessageCircle, Leaf
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import SpeakButton from '@/components/SpeakButton';
import ReadPageButton from '@/components/ReadPageButton';
import { analyzeInsuranceEligibility } from '@/services/groqService';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { ArrowLeft } from 'lucide-react';

const Insurance = () => {
  const { t } = useTranslation();
  const [cropType, setCropType] = useState('');
  const [area, setArea] = useState('');
  const [expectedYield, setExpectedYield] = useState('');
  const [premium, setPremium] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [claimStatus, setClaimStatus] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const calculatePremium = () => {
    setLoading(true);
    setTimeout(() => {
      const basePremium = 500;
      const areaMultiplier = parseFloat(area) * 100;
      const cropMultiplier = cropType === 'wheat' ? 1.2 : cropType === 'rice' ? 1.5 : 1.0;
      const calculatedPremium = Math.round(basePremium + areaMultiplier * cropMultiplier);
      setPremium(calculatedPremium);
      setLoading(false);
    }, 2000);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAiLoading(true);
      setUploadedImage(URL.createObjectURL(file));
      try {
        const result = await analyzeInsuranceEligibility(file);
        setAiResult(result.eligibility);
      } catch (err) {
        setAiResult('AI analysis failed. Please try again.');
      } finally {
        setAiLoading(false);
      }
    }
  };

  const submitClaim = () => {
    setLoading(true);
    setTimeout(() => {
      setClaimStatus('approved');
      setLoading(false);
    }, 3000);
  };

  const insuranceSchemes = [
    {
      name: 'PMFBY',
      description: 'Pradhan Mantri Fasal Bima Yojana',
      coverage: 'Comprehensive crop insurance',
      premium: '1.5% - 5% of sum insured',
      link: 'https://pmfby.gov.in/'
    },
    {
      name: 'WBCIS',
      description: 'Weather Based Crop Insurance Scheme',
      coverage: 'Weather-related losses',
      premium: '2% - 8% of sum insured',
      link: 'https://pmfby.gov.in/wbcis'
    },
    {
      name: 'MNAIS',
      description: 'Modified National Agricultural Insurance Scheme',
      coverage: 'Yield-based insurance',
      premium: '3.5% - 8% of sum insured',
      link: 'https://agricoop.nic.in/en/MNAIS'
    }
  ];

  const recentClaims = [
    {
      id: 'CLM001',
      crop: 'Wheat',
      area: '2.5 hectares',
      claimAmount: '₹45,000',
      status: 'approved',
      date: '2024-01-15'
    },
    {
      id: 'CLM002',
      crop: 'Rice',
      area: '1.8 hectares',
      claimAmount: '₹32,000',
      status: 'pending',
      date: '2024-01-10'
    }
  ];

  const microfinanceOptions = [
    {
      name: 'Kisan Credit Card',
      amount: '₹3,00,000',
      interest: '7% p.a.',
      tenure: '5 years'
    },
    {
      name: 'PM-KISAN',
      amount: '₹6,000/year',
      interest: 'Interest-free',
      tenure: 'Annual'
    },
    {
      name: 'NABARD Loans',
      amount: '₹10,00,000',
      interest: '8.5% p.a.',
      tenure: '7 years'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold hero-text flex items-center gap-2">
            {t('insurance')}
            <SpeakButton textKey="insurance" />
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('calculatePremium')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <Badge variant="outline" className="text-xs">{t('aiPowered')}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Premium Calculator */}
        <Card className="agri-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5" />
              <span>{t('premiumCalculator')}</span>
            </CardTitle>
            <CardDescription>
              {t('calculatePremium')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="crop-type">{t('cropType')}</Label>
                <Select value={cropType} onValueChange={setCropType}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectCommodity')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wheat">Wheat</SelectItem>
                    <SelectItem value="rice">Rice</SelectItem>
                    <SelectItem value="maize">Maize</SelectItem>
                    <SelectItem value="cotton">Cotton</SelectItem>
                    <SelectItem value="sugarcane">Sugarcane</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">{t('farmArea')}</Label>
                <Input 
                  id="area" 
                  type="number" 
                  placeholder="5.2" 
                  value={area} 
                  onChange={(e) => setArea(e.target.value)} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expected-yield">{t('expectedYield')}</Label>
              <Input 
                id="expected-yield" 
                type="number" 
                placeholder="2500" 
                value={expectedYield} 
                onChange={(e) => setExpectedYield(e.target.value)} 
              />
            </div>
            <Button 
              className="w-full gradient-primary" 
              onClick={calculatePremium} 
              disabled={loading || !cropType || !area}
            >
              {loading ? t('fetching') : t('calculatePremium')}
            </Button>
            
            {premium && (
              <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('estimatedPremium')}</span>
                  <span className="text-2xl font-bold text-primary">₹{premium}</span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {t('maximumCoverage')}: ₹{premium * 10}
                </div>
                <div className="mt-1 text-xs text-green-600">
                  {t('savingsVsMarket')}: ₹{Math.round(premium * 0.3)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Claim Verdict */}
        <Card className="agri-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>{t('aiClaimVerdict')}</span>
            </CardTitle>
            <CardDescription>
              {t('fileNewClaim')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="claim-image">{t('uploadImage')}</Label>
              <Input 
                id="claim-image" 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
              />
            </div>
            
            {uploadedImage && (
              <div className="space-y-2">
                <img 
                  src={uploadedImage} 
                  alt="Uploaded crop" 
                  className="w-full h-32 object-cover rounded-lg"
                />
                {aiLoading ? (
                  <div className="text-sm text-primary">Analyzing with AI...</div>
                ) : aiResult ? (
                  <div className="text-sm text-green-700 dark:text-green-300">AI Verdict: {aiResult}</div>
                ) : null}
                <div className="space-y-2">
                  <Label htmlFor="claim-reason">{t('claimReason')}</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder={t('claimReason')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="drought">Drought</SelectItem>
                      <SelectItem value="flood">Flood</SelectItem>
                      <SelectItem value="pest">Pest Attack</SelectItem>
                      <SelectItem value="disease">Disease</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  className="w-full gradient-primary" 
                  onClick={submitClaim} 
                  disabled={loading}
                >
                  {loading ? t('verifyingClaim') : t('submitClaim')}
                </Button>
              </div>
            )}

            {claimStatus && (
              <div className={`mt-4 p-4 rounded-lg border ${
                claimStatus === 'approved' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center space-x-2">
                  {claimStatus === 'approved' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="font-semibold">
                    {claimStatus === 'approved' ? t('approved') : t('rejected')}
                  </span>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {claimStatus === 'approved' 
                    ? 'Your claim has been approved. Payment will be processed within 7 days.'
                    : 'Your claim has been rejected. Please contact support for more information.'
                  }
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Claims */}
      <Card className="agri-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>{t('recentClaims')}</span>
          </CardTitle>
          <CardDescription>
            {t('trackClaimStatus')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentClaims.map((claim) => (
              <div key={claim.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{claim.crop}</p>
                    <p className="text-sm text-muted-foreground">
                      {claim.area} • {claim.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">{claim.claimAmount}</p>
                  <Badge 
                    variant={claim.status === 'approved' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {claim.status === 'approved' ? t('approved') : 'Pending'}
                  </Badge>
                </div>
              </div>
            ))}
            <Button className="w-full gradient-primary">
              {t('fileNewClaimBtn')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Insurance Schemes */}
      <Card className="agri-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5" />
            <span>{t('availableInsuranceSchemes')}</span>
          </CardTitle>
          <CardDescription>
            {t('applyForInsurance')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insuranceSchemes.map((scheme) => (
              <div key={scheme.name} className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{scheme.name}</h3>
                  <Badge variant="outline" className="text-xs">Popular</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{scheme.description}</p>
                <div className="space-y-1 text-xs">
                  <p><span className="font-medium">Coverage:</span> {scheme.coverage}</p>
                  <p><span className="font-medium">Premium:</span> {scheme.premium}</p>
                </div>
                <div className="flex space-x-2 mt-3">
                  <a href={scheme.link} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button size="sm" variant="outline" className="w-full">
                      {t('learnMore')}
                    </Button>
                  </a>
                  <Button size="sm" className="flex-1 gradient-primary">
                    {t('applyNow')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Microfinance Options */}
      <Card className="agri-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>{t('microfinanceOptions')}</span>
          </CardTitle>
          <CardDescription>
            {t('accessCredit')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {microfinanceOptions.map((option) => (
              <div key={option.name} className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                <h3 className="font-semibold mb-2">{option.name}</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Amount:</span> {option.amount}</p>
                  <p><span className="font-medium">Interest:</span> {option.interest}</p>
                  <p><span className="font-medium">Tenure:</span> {option.tenure}</p>
                </div>
                <Button className="w-full mt-3 gradient-primary">
                  {t('applyNow')}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Chat Assistant */}
      <Card className="agri-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>{t('aiChatAssistant')}</span>
          </CardTitle>
          <CardDescription>
            {t('getInstantAnswers')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-secondary/50">
              <MessageCircle className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">{t('availability')}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/50">
              <Brain className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">{t('multiLanguageSupport')}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/50">
              <Leaf className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">{t('cropSpecificAdvice')}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/50">
              <Phone className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">{t('voiceAdvisory')}</p>
            </div>
          </div>
          <div className="mt-4 flex space-x-2">
            <Button className="flex-1 gradient-primary">
              {t('callAgriculturalExperts')}
            </Button>
            <Button variant="outline" className="flex-1">
              {t('expertConsultation')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reference links for Groq API and Meta Llama Model */}
      <div className="mt-6 text-xs text-muted-foreground text-center">
        <a href="https://console.groq.com/docs" target="_blank" rel="noopener noreferrer" className="underline text-primary">Groq API Docs</a>
        {' | '}
        <a href="https://ai.meta.com/llama/" target="_blank" rel="noopener noreferrer" className="underline text-primary">Meta Llama Model</a>
      </div>
    </div>
  );
};

export default Insurance;
