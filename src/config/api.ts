// API Configuration
// In production, these should be environment variables loaded via backend

export const config = {
  onlyfansApi: {
    baseUrl: 'https://api.onlyfansapi.com/v1',
    // API key should be stored securely - use backend proxy in production
    // For development, this can be set via .env.local
    apiKey: import.meta.env.VITE_ONLYFANS_API_KEY || '',
  },
  
  // Connected OF model accounts (from Infloww)
  models: [
    { id: 'izzie', name: 'Izzie', handle: '@myizzyreal', type: 'AI' },
    { id: 'lucinda', name: 'Lucinda', handle: '@lucibleu', type: 'AI' },
    { id: 'willow', name: 'Willow', handle: '@ginger5foot', type: 'REAL' },
    { id: 'ashley', name: 'Ashley Morris', handle: '@ashleymorris', type: 'AI' },
  ],
  
  // Chatters (from Infloww employee list)
  chatters: [
    { id: 'jane', name: 'Jane', scheduledHours: 16 },
    { id: 'kenneth', name: 'Kenneth', scheduledHours: 15 },
    { id: 'jaydee', name: 'Jaydee', scheduledHours: 15 },
    { id: 'jemimah', name: 'Jemimah', scheduledHours: 15 },
    { id: 'mark', name: 'Mark', scheduledHours: 15 },
  ],
  
  // Shift configuration
  shifts: {
    morning: { start: '09:00', end: '15:00', label: 'Morning' },
    afternoon: { start: '15:00', end: '21:00', label: 'Afternoon' },
    night: { start: '21:00', end: '03:00', label: 'Night' },
  },
};

export default config;
