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
