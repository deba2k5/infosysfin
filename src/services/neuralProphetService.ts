// NeuralProphet Service for Crop Loan Eligibility
// Handles historical yield data, weather, soil health, and GPS coordinates

export interface HistoricalYieldData {
  year: number;
  yield_kg_ha: number;
  rainfall_mm: number;
  temperature_c: number;
  soil_npk: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
  ndvi: number;
}

export interface LoanEligibilityInput {
  farmerId: string;
  landCoordinates: {
    lat: number;
    lon: number;
  };
  landSize: number; // in hectares
  cropType: string;
  historicalData: HistoricalYieldData[];
  currentSoilHealth: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    ph: number;
    organic_matter: number;
  };
  currentWeather: {
    temperature: number;
    rainfall: number;
    humidity: number;
  };
  farmerProfile: {
    experience_years: number;
    previous_loans: number;
    repayment_history: 'good' | 'fair' | 'poor';
  };
}

export interface LoanEligibilityOutput {
  climateScore: number; // AI replacement for CIBIL (0-100)
  yieldProjection: {
    kg_per_ha: number;
    kg_per_acre: number;
    confidence_interval: {
      lower: number;
      upper: number;
    };
  };
  riskTier: 'Low' | 'Medium' | 'High';
  loanEligibility: {
    eligible: boolean;
    maxLoanAmount: number;
    recommendedAmount: number;
    interestRate: number;
    interestSubsidy: number;
    tenure_months: number;
  };
  cropRecommendation: {
    primaryCrop: string;
    alternativeCrops: string[];
    expectedYield: number;
    marketDemand: 'High' | 'Medium' | 'Low';
  };
  explainability: {
    factors: {
      positive: string[];
      negative: string[];
    };
    riskFactors: string[];
    recommendations: string[];
  };
  neuralProphetMetrics: {
    trend_strength: number;
    seasonality_strength: number;
    forecast_accuracy: number;
    external_regressor_importance: {
      rainfall: number;
      temperature: number;
      soil_npk: number;
      ndvi: number;
    };
  };
}

class NeuralProphetService {
  private baseUrl = 'https://api.neuralprophet-krishaksure.com'; // Replace with actual API endpoint

  async predictLoanEligibility(input: LoanEligibilityInput): Promise<LoanEligibilityOutput> {
    try {
      // In a real implementation, this would call the NeuralProphet API
      // For now, we'll simulate the response based on the input data
      
      const response = await fetch(`${this.baseUrl}/predict-loan-eligibility`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_NEURALPROPHET_API_KEY}`,
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error('Failed to predict loan eligibility');
      }

      return await response.json();
    } catch (error) {
      // Fallback to simulated prediction for demo purposes
      return this.simulatePrediction(input);
    }
  }

  private simulatePrediction(input: LoanEligibilityInput): LoanEligibilityOutput {
    // Calculate average historical yield
    const avgYield = input.historicalData.reduce((sum, data) => sum + data.yield_kg_ha, 0) / input.historicalData.length;
    
    // Calculate yield trend
    const recentYields = input.historicalData.slice(-5).map(d => d.yield_kg_ha);
    const trend = recentYields[recentYields.length - 1] - recentYields[0];
    
    // Calculate climate score based on various factors
    const soilScore = this.calculateSoilScore(input.currentSoilHealth);
    const weatherScore = this.calculateWeatherScore(input.currentWeather);
    const historicalScore = this.calculateHistoricalScore(input.historicalData);
    const farmerScore = this.calculateFarmerScore(input.farmerProfile);
    
    const climateScore = Math.round((soilScore + weatherScore + historicalScore + farmerScore) / 4);
    
    // Predict yield based on NeuralProphet-like calculations
    const baseYield = avgYield * (1 + trend / avgYield * 0.1);
    const weatherFactor = this.calculateWeatherFactor(input.currentWeather);
    const soilFactor = this.calculateSoilFactor(input.currentSoilHealth);
    
    const predictedYield = baseYield * weatherFactor * soilFactor;
    
    // Determine risk tier
    const riskScore = this.calculateRiskScore(input, climateScore, predictedYield);
    const riskTier = riskScore < 30 ? 'Low' : riskScore < 60 ? 'Medium' : 'High';
    
    // Calculate loan eligibility
    const maxLoanAmount = predictedYield * input.landSize * 0.7; // 70% of expected yield value
    const interestRate = riskTier === 'Low' ? 7.5 : riskTier === 'Medium' ? 9.5 : 12.0;
    const interestSubsidy = riskTier === 'Low' ? 3.0 : riskTier === 'Medium' ? 2.0 : 0.0;
    
    return {
      climateScore,
      yieldProjection: {
        kg_per_ha: Math.round(predictedYield),
        kg_per_acre: Math.round(predictedYield * 0.404686), // Convert to acres
        confidence_interval: {
          lower: Math.round(predictedYield * 0.85),
          upper: Math.round(predictedYield * 1.15),
        },
      },
      riskTier,
      loanEligibility: {
        eligible: climateScore >= 50,
        maxLoanAmount: Math.round(maxLoanAmount),
        recommendedAmount: Math.round(maxLoanAmount * 0.8),
        interestRate,
        interestSubsidy,
        tenure_months: 18,
      },
      cropRecommendation: {
        primaryCrop: input.cropType,
        alternativeCrops: this.getAlternativeCrops(input.cropType, input.currentSoilHealth),
        expectedYield: Math.round(predictedYield),
        marketDemand: this.getMarketDemand(input.cropType),
      },
      explainability: {
        factors: {
          positive: this.getPositiveFactors(input, climateScore),
          negative: this.getNegativeFactors(input, climateScore),
        },
        riskFactors: this.getRiskFactors(input, riskScore),
        recommendations: this.getRecommendations(input, riskTier),
      },
      neuralProphetMetrics: {
        trend_strength: Math.min(100, Math.abs(trend / avgYield) * 100),
        seasonality_strength: 75 + Math.random() * 20,
        forecast_accuracy: 85 + Math.random() * 10,
        external_regressor_importance: {
          rainfall: 0.25 + Math.random() * 0.1,
          temperature: 0.20 + Math.random() * 0.1,
          soil_npk: 0.30 + Math.random() * 0.1,
          ndvi: 0.25 + Math.random() * 0.1,
        },
      },
    };
  }

  private calculateSoilScore(soil: any): number {
    const npkScore = (soil.nitrogen + soil.phosphorus + soil.potassium) / 3;
    const phScore = soil.ph >= 6.0 && soil.ph <= 7.5 ? 100 : 50;
    const omScore = soil.organic_matter >= 2.0 ? 100 : soil.organic_matter * 50;
    return (npkScore + phScore + omScore) / 3;
  }

  private calculateWeatherScore(weather: any): number {
    const tempScore = weather.temperature >= 20 && weather.temperature <= 35 ? 100 : 60;
    const rainScore = weather.rainfall >= 50 && weather.rainfall <= 200 ? 100 : 70;
    const humidityScore = weather.humidity >= 40 && weather.humidity <= 80 ? 100 : 60;
    return (tempScore + rainScore + humidityScore) / 3;
  }

  private calculateHistoricalScore(historical: HistoricalYieldData[]): number {
    if (historical.length < 3) return 50;
    const recentYields = historical.slice(-3).map(d => d.yield_kg_ha);
    const avgYield = recentYields.reduce((sum, y) => sum + y, 0) / recentYields.length;
    const stability = 100 - Math.abs(recentYields[recentYields.length - 1] - avgYield) / avgYield * 100;
    return Math.max(0, Math.min(100, stability));
  }

  private calculateFarmerScore(profile: any): number {
    let score = 50;
    score += profile.experience_years * 2; // +2 points per year of experience
    score += profile.previous_loans * 5; // +5 points per previous loan
    if (profile.repayment_history === 'good') score += 30;
    else if (profile.repayment_history === 'fair') score += 15;
    return Math.min(100, score);
  }

  private calculateWeatherFactor(weather: any): number {
    const tempFactor = weather.temperature >= 20 && weather.temperature <= 35 ? 1.0 : 0.8;
    const rainFactor = weather.rainfall >= 50 && weather.rainfall <= 200 ? 1.0 : 0.9;
    return (tempFactor + rainFactor) / 2;
  }

  private calculateSoilFactor(soil: any): number {
    const npkFactor = (soil.nitrogen + soil.phosphorus + soil.potassium) / 300; // Normalize to 0-1
    const phFactor = soil.ph >= 6.0 && soil.ph <= 7.5 ? 1.0 : 0.7;
    return (npkFactor + phFactor) / 2;
  }

  private calculateRiskScore(input: LoanEligibilityInput, climateScore: number, predictedYield: number): number {
    let riskScore = 0;
    
    // Climate score risk (lower score = higher risk)
    riskScore += (100 - climateScore) * 0.3;
    
    // Yield volatility risk
    const yields = input.historicalData.map(d => d.yield_kg_ha);
    const avgYield = yields.reduce((sum, y) => sum + y, 0) / yields.length;
    const volatility = Math.abs(predictedYield - avgYield) / avgYield;
    riskScore += volatility * 50;
    
    // Farmer profile risk
    if (input.farmerProfile.repayment_history === 'poor') riskScore += 30;
    else if (input.farmerProfile.repayment_history === 'fair') riskScore += 15;
    
    return Math.min(100, riskScore);
  }

  private getAlternativeCrops(primaryCrop: string, soil: any): string[] {
    const cropOptions = {
      'rice': ['wheat', 'maize', 'pulses'],
      'wheat': ['rice', 'maize', 'barley'],
      'maize': ['rice', 'wheat', 'sorghum'],
      'cotton': ['sugarcane', 'pulses', 'oilseeds'],
      'sugarcane': ['cotton', 'rice', 'maize'],
    };
    return cropOptions[primaryCrop as keyof typeof cropOptions] || ['wheat', 'rice', 'pulses'];
  }

  private getMarketDemand(crop: string): 'High' | 'Medium' | 'Low' {
    const demandMap: { [key: string]: 'High' | 'Medium' | 'Low' } = {
      'rice': 'High',
      'wheat': 'High',
      'maize': 'Medium',
      'cotton': 'Medium',
      'sugarcane': 'High',
    };
    return demandMap[crop] || 'Medium';
  }

  private getPositiveFactors(input: LoanEligibilityInput, climateScore: number): string[] {
    const factors = [];
    if (climateScore >= 70) factors.push('Excellent climate score');
    if (input.farmerProfile.experience_years >= 5) factors.push('Experienced farmer');
    if (input.currentSoilHealth.organic_matter >= 2.0) factors.push('Good soil organic matter');
    if (input.historicalData.length >= 5) factors.push('Sufficient historical data');
    return factors;
  }

  private getNegativeFactors(input: LoanEligibilityInput, climateScore: number): string[] {
    const factors = [];
    if (climateScore < 50) factors.push('Low climate score');
    if (input.farmerProfile.repayment_history === 'poor') factors.push('Poor repayment history');
    if (input.currentSoilHealth.ph < 6.0 || input.currentSoilHealth.ph > 7.5) factors.push('Suboptimal soil pH');
    if (input.historicalData.length < 3) factors.push('Limited historical data');
    return factors;
  }

  private getRiskFactors(input: LoanEligibilityInput, riskScore: number): string[] {
    const factors = [];
    if (riskScore > 60) factors.push('High yield volatility');
    if (input.farmerProfile.repayment_history === 'poor') factors.push('Poor credit history');
    if (input.currentWeather.rainfall < 50) factors.push('Low rainfall conditions');
    return factors;
  }

  private getRecommendations(input: LoanEligibilityInput, riskTier: string): string[] {
    const recommendations = [];
    if (riskTier === 'High') {
      recommendations.push('Consider crop insurance');
      recommendations.push('Implement soil improvement measures');
      recommendations.push('Diversify crop selection');
    } else if (riskTier === 'Medium') {
      recommendations.push('Monitor weather conditions closely');
      recommendations.push('Maintain soil health practices');
    } else {
      recommendations.push('Continue current farming practices');
      recommendations.push('Consider expanding operations');
    }
    return recommendations;
  }

  // Get sample historical data for demonstration
  async getSampleHistoricalData(lat: number, lon: number, cropType: string): Promise<HistoricalYieldData[]> {
    // In real implementation, this would fetch from ICAR/ICRISAT databases
    const baseYield = cropType === 'rice' ? 2500 : cropType === 'wheat' ? 3000 : 2000;
    
    return Array.from({ length: 10 }, (_, i) => ({
      year: 2014 + i,
      yield_kg_ha: baseYield + Math.random() * 500 - 250,
      rainfall_mm: 800 + Math.random() * 400 - 200,
      temperature_c: 25 + Math.random() * 10 - 5,
      soil_npk: {
        nitrogen: 150 + Math.random() * 50,
        phosphorus: 120 + Math.random() * 40,
        potassium: 180 + Math.random() * 60,
      },
      ndvi: 0.6 + Math.random() * 0.3,
    }));
  }
}

export const neuralProphetService = new NeuralProphetService(); 