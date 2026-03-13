// API Configuration
// In production, these should be environment variables loaded via backend

export const config = {
  platformApi: {
    baseUrl: 'https://api.example.com/v1',
    // API key should be stored securely - use backend proxy in production
    // For development, this can be set via .env.local
    apiKey: import.meta.env.VITE_PLATFORM_API_KEY || '',
  },
  
  // Connected model accounts
  models: [
    { id: 'izzie', name: 'Izzie', handle: '@myizzyreal', type: '' },
    { id: 'lucinda', name: 'Lucinda', handle: '@lucibleu', type: '' },
    { id: 'willow', name: 'Willow', handle: '@ginger5foot', type: '' },
    { id: 'ashley', name: 'Ashley Morris', handle: '@ashleymorris', type: '' },
  ],
  
  // Chatters (real team roster)
  chatters: [
    { id: 'marc', name: 'Marc', scheduledHours: 16 },
    { id: 'jemimah', name: 'Jemimah', scheduledHours: 15 },
    { id: 'jane', name: 'Jane', scheduledHours: 15 },
    { id: 'kc', name: 'KC', scheduledHours: 15 },
    { id: 'kenneth', name: 'Kenneth', scheduledHours: 15 },
    { id: 'jaydee', name: 'Jaydee', scheduledHours: 15 },
  ],
  
  // Shift configuration
  shifts: {
    morning: { start: '06:00', end: '14:00', label: 'Morning' },
    afternoon: { start: '14:00', end: '22:00', label: 'Afternoon' },
    night: { start: '22:00', end: '06:00', label: 'Night' },
  },
};

export default config;
