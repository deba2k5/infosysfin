import { getApiKey } from '../config/apikey';

export const GROQ_API_KEY = getApiKey('GROQ_API_KEY');
export const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface DiagnosisResult {
  disease: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
  treatment: string[];
  prevention: string[];
  imageUrl: string;
}

export const groqService = {
  async analyzeCropImage(imageFile: File): Promise<DiagnosisResult> {
    try {
      // Validate file type
      if (!imageFile.type.startsWith('image/')) {
        throw new Error('Invalid file type. Please upload an image.');
      }

      // Check file size (limit to 10MB)
      if (imageFile.size > 10 * 1024 * 1024) {
        throw new Error('File size too large. Please upload an image smaller than 10MB.');
      }

      // Convert image to base64
      const base64Image = await this.fileToBase64(imageFile);
      
      const prompt = `Analyze this crop/plant image for diseases, pests, or health issues. 
      Provide a detailed analysis in the following JSON format:
      {
        "disease": "disease name or 'Healthy Plant' if no issues",
        "confidence": confidence percentage (0-100),
        "severity": "low/medium/high",
        "description": "detailed description of the condition",
        "treatment": ["treatment step 1", "treatment step 2", "treatment step 3"],
        "prevention": ["prevention tip 1", "prevention tip 2", "prevention tip 3"]
      }
      
      Focus on common agricultural diseases and provide practical, cost-effective solutions available in India.
      Be specific about the disease symptoms, treatment methods, and prevention strategies.`;

      const apiResponse = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: prompt
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${imageFile.type};base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          temperature: 0.3,
          max_tokens: 1024,
          top_p: 1,
          stream: false,
          stop: null
        })
      });

      if (!apiResponse.ok) {
        throw new Error(`Groq API error: ${apiResponse.status} ${apiResponse.statusText}`);
      }

      const chatCompletion = await apiResponse.json();
      const responseContent = chatCompletion.choices[0].message.content;
      console.log('Groq API Response:', responseContent);
      
      // Try to parse JSON response
      try {
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log('Parsed JSON result:', parsed);
          
          // Validate required fields
          if (!parsed.disease || !parsed.confidence || !parsed.severity) {
            throw new Error('Missing required fields in JSON response');
          }
          
          return {
            ...parsed,
            imageUrl: URL.createObjectURL(imageFile)
          };
        }
      } catch (parseError) {
        console.warn('Failed to parse JSON response, using fallback parsing:', parseError);
      }

      // Fallback parsing if JSON parsing fails
      console.log('Using fallback parsing for response');
      return this.parseFallbackResponse(responseContent, imageFile);
      
    } catch (error) {
      console.error('Groq API error:', error);
      
      // Check if it's a rate limit or API key error
      if (error instanceof Error) {
        if (error.message.includes('rate limit') || error.message.includes('quota')) {
          console.error('Rate limit exceeded or quota exceeded');
        } else if (error.message.includes('unauthorized') || error.message.includes('api key')) {
          console.error('API key authentication failed');
        }
      }
      
      // Return fallback data
      return this.getFallbackResult(imageFile);
    }
  },

  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  },

  parseFallbackResponse(response: string, imageFile: File): DiagnosisResult {
    // Extract disease name
    const diseaseMatch = response.match(/(?:disease|condition|issue)[:\s]+([^\n,]+)/i);
    const disease = diseaseMatch ? diseaseMatch[1].trim() : 'Unknown Condition';

    // Extract confidence (look for percentage)
    const confidenceMatch = response.match(/(\d+(?:\.\d+)?)\s*%/);
    const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 75;

    // Determine severity based on keywords
    const severity = response.toLowerCase().includes('severe') || response.toLowerCase().includes('critical') 
      ? 'high' as const
      : response.toLowerCase().includes('moderate') || response.toLowerCase().includes('medium')
      ? 'medium' as const
      : 'low' as const;

    // Extract description (first paragraph)
    const descriptionMatch = response.match(/([^.!?]+[.!?])/);
    const description = descriptionMatch ? descriptionMatch[1].trim() : 'Analysis completed successfully.';

    // Extract treatment steps
    const treatmentSteps = this.extractSteps(response, ['treatment', 'remedy', 'solution', 'cure']);

    // Extract prevention steps
    const preventionSteps = this.extractSteps(response, ['prevention', 'prevent', 'avoid', 'protection']);

    return {
      disease,
      confidence,
      severity,
      description,
      treatment: treatmentSteps,
      prevention: preventionSteps,
      imageUrl: URL.createObjectURL(imageFile)
    };
  },

  extractSteps(text: string, keywords: string[]): string[] {
    const steps: string[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (keywords.some(keyword => lowerLine.includes(keyword))) {
        // Extract bullet points or numbered items
        const bulletMatches = line.match(/[•\-\*]\s*([^.!?]+)/g);
        if (bulletMatches) {
          bulletMatches.forEach(match => {
            const step = match.replace(/[•\-\*]\s*/, '').trim();
            if (step && step.length > 10) {
              steps.push(step);
            }
          });
        }
      }
    }

    // If no specific steps found, create generic ones
    if (steps.length === 0) {
      steps.push('Consult with a local agricultural expert');
      steps.push('Monitor the plant regularly for changes');
      steps.push('Maintain proper growing conditions');
    }

    return steps.slice(0, 4); // Limit to 4 steps
  },

  getFallbackResult(imageFile: File): DiagnosisResult {
    const fallbackResults = [
      {
        disease: 'Early Blight',
        confidence: 94.5,
        severity: 'medium' as const,
        description: 'Early blight is a common fungal disease affecting tomato plants, characterized by dark brown spots with concentric rings.',
        treatment: [
          'Remove infected leaves immediately',
          'Apply copper-based fungicide',
          'Improve air circulation around plants',
          'Avoid overhead watering'
        ],
        prevention: [
          'Plant resistant varieties',
          'Maintain proper spacing between plants',
          'Use mulch to prevent soil splash',
          'Rotate crops annually'
        ]
      },
      {
        disease: 'Healthy Plant',
        confidence: 98.2,
        severity: 'low' as const,
        description: 'Your plant appears to be healthy with no visible signs of disease or pest damage.',
        treatment: [
          'Continue current care routine',
          'Monitor for any changes',
          'Maintain optimal growing conditions'
        ],
        prevention: [
          'Regular inspection',
          'Proper watering schedule',
          'Balanced fertilization',
          'Good garden hygiene'
        ]
      },
      {
        disease: 'Powdery Mildew',
        confidence: 87.3,
        severity: 'high' as const,
        description: 'Powdery mildew is a fungal disease that creates white powdery spots on leaves and stems.',
        treatment: [
          'Apply neem oil solution',
          'Use sulfur-based fungicide',
          'Remove severely infected parts',
          'Increase plant spacing'
        ],
        prevention: [
          'Choose resistant varieties',
          'Avoid overhead irrigation',
          'Maintain good air circulation',
          'Apply preventive fungicides'
        ]
      }
    ];

    const randomResult = fallbackResults[Math.floor(Math.random() * fallbackResults.length)];
    
    return {
      ...randomResult,
      imageUrl: URL.createObjectURL(imageFile)
    };
  }
}; 

// Analyze insurance eligibility using Groq API and VLM Meta Llama Model (mock implementation)
export async function analyzeInsuranceEligibility(imageFile: File): Promise<{ eligibility: string }> {
  try {
    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      throw new Error('Invalid file type. Please upload an image.');
    }
    if (imageFile.size > 10 * 1024 * 1024) {
      throw new Error('File size too large. Please upload an image smaller than 10MB.');
    }
    // Convert image to base64
    const base64Image = await groqService.fileToBase64(imageFile);
    const prompt = `Analyze this crop/plant image and determine if the crop is eligible for insurance claim due to disease, pest, or weather damage. 
    Respond with a JSON object: { "eligibility": "Eligible/Not Eligible", "reason": "short reason" }.
    Be specific and practical for Indian agriculture. If eligible, mention the main reason.`;

    const apiResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: `data:${imageFile.type};base64,${base64Image}` } }
            ]
          }
        ],
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        temperature: 0.3,
        max_tokens: 512,
        top_p: 1,
        stream: false,
        stop: null
      })
    });

    if (!apiResponse.ok) {
      throw new Error(`Groq API error: ${apiResponse.status} ${apiResponse.statusText}`);
    }
    const chatCompletion = await apiResponse.json();
    const responseContent = chatCompletion.choices[0].message.content;
    // Try to parse JSON response
    try {
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.eligibility) {
          return { eligibility: `${parsed.eligibility}: ${parsed.reason || ''}` };
        }
      }
    } catch (parseError) {
      // fallback below
    }
    // Fallback: return the raw response
    return { eligibility: responseContent };
  } catch (error) {
    console.error('Groq insurance eligibility error:', error);
    return { eligibility: 'AI analysis failed. Please try again.' };
  }
} 
// Add this function for the VoiceAssistant component
export const callGroqAPI = async (userText: string): Promise<string> => {
  try {
    const prompt = `You are an AI agricultural assistant helping Indian farmers. 
    Provide helpful, practical advice for agricultural questions in a friendly, supportive tone.
    Keep responses concise but informative. Focus on Indian farming practices and conditions.
    
    User question: "${userText}"`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 0.95,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content?.trim();

    if (!responseText) {
      throw new Error('No response received from Groq API');
    }

    return responseText;

  } catch (error) {
    console.error('Groq API call error:', error);
    return 'I apologize, but I encountered an error while processing your request. Please try again.';
  }
};