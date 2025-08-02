// src/config/apikey.ts

export const getApiKey = (keyName: string): string => {
  const keys: Record<string, string> = {
    'GROQ_API_KEY': 'your_groq_api_key_here',
    'GEMINI_API_KEY': 'your_gemini_api_key_here'
  };
  
  return keys[keyName] || '';
};

// Alternative: Use environment variables (recommended for production)
// export const getApiKey = (keyName: string): string => {
//   return process.env[`REACT_APP_${keyName}`] || '';
// };