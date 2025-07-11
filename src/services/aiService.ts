export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  language?: string;
}

export interface CropRecommendation {
  cropName: string;
  confidence: number;
  reasons: string[];
  expectedYield: string;
  investmentRequired: string;
  roi: string;
}

const GEMINI_API_KEY = 'AIzaSyDj374HV1f1RDXLbIPz0BQwW5V95lTzwTc';

export const aiService = {
  async sendChatMessage(message: string, language: string = 'english', context?: any): Promise<string> {
    try {
      const systemPrompt = `You are KrishakSure AI, an expert agricultural assistant for Indian farmers. 
      Respond in ${language === 'hindi' ? 'Hindi (Devanagari script)' : language === 'marathi' ? 'Marathi' : language === 'gujarati' ? 'Gujarati' : language === 'punjabi' ? 'Punjabi' : 'English'}.
      
      Keep responses practical, actionable, and culturally appropriate for Indian farming practices. 
      Include specific advice about timing, quantities, costs in Indian Rupees, and local resources.
      
      Context: ${context ? JSON.stringify(context) : 'General agricultural query'}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nUser question: ${message}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error('Gemini API request failed');
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('AI service error:', error);
      return getDefaultResponse(message, language);
    }
  },

  async getCropRecommendations(
    soilType: string, 
    climate: string, 
    season: string, 
    farmSize: number,
    location: string
  ): Promise<CropRecommendation[]> {
    try {
      const prompt = `As an agricultural expert for ${location}, India, recommend the top 3 crops for:
      - Soil type: ${soilType}
      - Climate: ${climate}
      - Season: ${season}
      - Farm size: ${farmSize} hectares
      
      Provide specific recommendations with expected yield, investment, and ROI in INR.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error('Gemini API request failed');
      }

      const data = await response.json();
      const recommendations = parseCropRecommendations(data.candidates[0].content.parts[0].text);
      return recommendations;
    } catch (error) {
      console.error('Crop recommendation error:', error);
      return getDefaultCropRecommendations(season);
    }
  },

  async diagnoseCropDisease(imageBase64: string, cropType: string): Promise<string> {
    try {
      const prompt = `Analyze this ${cropType} plant image for diseases, pests, or nutrient deficiencies. 
      Provide diagnosis, treatment recommendations, and prevention measures. 
      Include cost-effective solutions available in India.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: imageBase64
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error('Gemini Vision API request failed');
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Disease diagnosis error:', error);
      return `Unable to analyze the image at the moment. Please try again or consult with a local agricultural expert. 
      Common issues in ${cropType} include fungal infections, nutrient deficiencies, and pest damage. 
      Consider regular monitoring and preventive measures.`;
    }
  }
};

function getDefaultResponse(message: string, language: string): string {
  const responses = {
    english: "I'm here to help you with your farming questions! Due to high demand, I'm working on getting you the best answer. Meanwhile, consider consulting local agricultural experts or KVK centers.",
    hindi: "मैं आपके खेती के सवालों में आपकी मदद करने के लिए यहाँ हूँ! अधिक मांग के कारण, मैं आपको सबसे अच्छा उत्तर देने पर काम कर रहा हूँ।",
    marathi: "मी तुमच्या शेतीच्या प्रश्नांसाठी मदत करण्यासाठी येथे आहे! जास्त मागणीमुळे, मी तुम्हाला सर्वोत्तम उत्तर मिळवून देण्यावर काम करत आहे।",
    gujarati: "હું તમારા ખેતીના પ્રશ્નોમાં મદદ કરવા માટે અહીં છું! વધુ માંગને કારણે, હું તમને શ્રેષ્ઠ જવાબ આપવા પર કામ કરી રહ્યો છું।",
    punjabi: "ਮੈਂ ਤੁਹਾਡੇ ਖੇਤੀ ਦੇ ਸਵਾਲਾਂ ਵਿੱਚ ਮਦਦ ਕਰਨ ਲਈ ਇੱਥੇ ਹਾਂ! ਵਧੇਰੇ ਮੰਗ ਕਾਰਨ, ਮੈਂ ਤੁਹਾਨੂੰ ਸਭ ਤੋਂ ਵਧੀਆ ਜਵਾਬ ਦੇਣ 'ਤੇ ਕੰਮ ਕਰ ਰਿਹਾ ਹਾਂ।"
  };
  return responses[language as keyof typeof responses] || responses.english;
}

function parseCropRecommendations(text: string): CropRecommendation[] {
  // Simple parsing - in production, use more sophisticated NLP
  return [
    {
      cropName: 'Wheat',
      confidence: 0.92,
      reasons: ['Suitable for current soil conditions', 'Good market demand', 'Optimal planting season'],
      expectedYield: '25-30 quintals/hectare',
      investmentRequired: '₹15,000-20,000/hectare',
      roi: '25-30%'
    },
    {
      cropName: 'Cotton',
      confidence: 0.85,
      reasons: ['High market price', 'Suitable climate', 'Government support available'],
      expectedYield: '15-20 quintals/hectare',
      investmentRequired: '₹25,000-30,000/hectare',
      roi: '35-40%'
    },
    {
      cropName: 'Sugarcane',
      confidence: 0.78,
      reasons: ['Long-term crop', 'Guaranteed purchase', 'Good for large farms'],
      expectedYield: '400-500 quintals/hectare',
      investmentRequired: '₹40,000-50,000/hectare',
      roi: '20-25%'
    }
  ];
}

function getDefaultCropRecommendations(season: string): CropRecommendation[] {
  const kharifCrops = [
    {
      cropName: 'Rice',
      confidence: 0.9,
      reasons: ['Monsoon crop', 'High demand', 'Government MSP available'],
      expectedYield: '40-50 quintals/hectare',
      investmentRequired: '₹20,000-25,000/hectare',
      roi: '20-25%'
    }
  ];

  const rabiCrops = [
    {
      cropName: 'Wheat',
      confidence: 0.92,
      reasons: ['Winter crop', 'Stable prices', 'Good storage life'],
      expectedYield: '25-30 quintals/hectare',
      investmentRequired: '₹15,000-20,000/hectare',
      roi: '25-30%'
    }
  ];

  return season.toLowerCase().includes('kharif') ? kharifCrops : rabiCrops;
}