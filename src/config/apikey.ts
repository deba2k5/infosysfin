// src/config/apikey.ts

export const getApiKey = (keyName: string): string => {
  const keys: Record<string, string> = {
    'GROQ_API_KEY': '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',
    'GEMINI_API_KEY': 'AIzaSyCZsfen_MxWzLe7al4SCGDYiS3jWi7CGN0'
  };
  
  return keys[keyName] || '';
};

// Alternative: Use environment variables (recommended for production)
// export const getApiKey = (keyName: string): string => {
//   return process.env[`REACT_APP_${keyName}`] || '';
// };