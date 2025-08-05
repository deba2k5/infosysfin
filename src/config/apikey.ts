// src/config/apikey.ts

export const getApiKey = (keyName: string): string => {
  const keys: Record<string, string> = {
    'GROQ_API_KEY': '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',
    'GEMINI_API_KEY': 'AIzaSyD6_vF36e2k3pRptEKYilWpAAOGJ6gKPUA'
  };
  
  return keys[keyName] || '';
};

// Alternative: Use environment variables (recommended for production)
// export const getApiKey = (keyName: string): string => {
//   return process.env[`REACT_APP_${keyName}`] || '';
// };
