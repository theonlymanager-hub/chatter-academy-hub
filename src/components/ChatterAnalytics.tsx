import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { platformApi, ACCOUNT_IDS, AccountStats, Fan } from '@/services/platformApi';
import { Settings, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ChatterShift {
  chatterId: string;
  chatterName: string;
  model: string;
  startTime: string;
  endTime: string;
  messageRevenue: number;
  messageCount: number;
  conversionRate: number;
}

interface ChatterPerformance {
  chatterId: string;
  chatterName: string;
  totalRevenue: number;
  avgRevenuePerShift: number;
  shiftsWorked: number;
  qualityScore: number;
  topModel: string;
}

// Real team roster
const CHATTERS = {
  marc: { id: '1', name: 'Marc', scheduledHours: 16 },
  jemimah: { id: '2', name: 'Jemimah', scheduledHours: 15 },
  jane: { id: '3', name: 'Jane', scheduledHours: 15 },
  kc: { id: '4', name: 'KC', scheduledHours: 15 },
  kenneth: { id: '5', name: 'KC', scheduledHours: 15 },
  jaydee: { id: '6', name: 'Jaydee', scheduledHours: 15 },
};

// Models
const MODELS = ['Izzie', 'Lucinda', 'Willow', 'Ashley'];

// Today's shifts - 1 chatter per model per shift for attribution
const mockShifts: ChatterShift[] = [
  { chatterId: CHATTERS.marc.id, chatterName: CHATTERS.marc.name, model: 'Izzie', startTime: '2026-03-09T06:00:00', endTime: '2026-03-09T14:00:00', messageRevenue: 245.50, messageCount: 42, conversionRate: 12.5 },
  { chatterId: CHATTERS.jemimah.id, chatterName: CHATTERS.jemimah.name, model: 'Lucinda', startTime: '2026-03-09T14:00:00', endTime: '2026-03-09T22:00:00', messageRevenue: 189.20, messageCount: 38, conversionRate: 10.2 },
  { chatterId: CHATTERS.jane.id, chatterName: CHATTERS.jane.name, model: 'Willow', startTime: '2026-03-09T06:00:00', endTime: '2026-03-09T14:00:00', messageRevenue: 312.00, messageCount: 56, conversionRate: 15.8 },
  { chatterId: CHATTERS.kc.id, chatterName: CHATTERS.kc.name, model: 'Ashley', startTime: '2026-03-09T22:00:00', endTime: '2026-03-10T06:00:00', messageRevenue: 178.90, messageCount: 31, conversionRate: 9.4 },
];

// Monthly performance data
const mockPerformance: ChatterPerformance[] = [
  { chatterId: CHATTERS.marc.id, chatterName: CHATTERS.marc.name, totalRevenue: 4520.00, avgRevenuePerShift: 301.33, shiftsWorked: 15, qualityScore: 92, topModel: 'Izzie' },
  { chatterId: CHATTERS.jemimah.id, chatterName: CHATTERS.jemimah.name, totalRevenue: 3890.50, avgRevenuePerShift: 259.37, shiftsWorked: 15, qualityScore: 88, topModel: 'Lucinda' },
  { chatterId: CHATTERS.jane.id, chatterName: CHATTERS.jane.name, totalRevenue: 3245.20, avgRevenuePerShift: 216.35, shiftsWorked: 15, qualityScore: 82, topModel: 'Willow' },
  { chatterId: CHATTERS.kc.id, chatterName: CHATTERS.kc.name, totalRevenue: 2890.00, avgRevenuePerShift: 192.67, shiftsWorked: 15, qualityScore: 78, topModel: 'Ashley' },
  { chatterId: CHATTERS.kenneth.id, chatterName: CHATTERS.kenneth.name, totalRevenue: 2650.00, avgRevenuePerShift: 176.67, shiftsWorked: 15, qualityScore: 75, topModel: 'Izzie' },
  { chatterId: CHATTERS.jaydee.id, chatterName: CHATTERS.jaydee.name, totalRevenue: 2420.00, avgRevenuePerShift: 161.33, shiftsWorked: 15, qualityScore: 72, topModel: 'Willow' },
];

export default function ChatterAnalytics() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [isLoading, setIsLoading] = useState(false);
  const [todayShifts, setTodayShifts] = useState<ChatterShift[]>(mockShifts);
  const [performance, setPerformance] = useState<ChatterPerformance[]>(mockPerformance);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [apiStatus, setApiStatus] = useState<'disconnected' | 'connected' | 'error'>('disconnected');
  const [liveStats, setLiveStats] = useState<Record<string, AccountStats | null>>({});
  const [topSpenders, setTopSpenders] = useState<Record<string, Fan[]>>({});

  // Load API key from localStorage
  useEffect(() => {
    const savedKey = platformApi.getApiKey();
    if (savedKey) {
      setApiKey(savedKey);
      setApiKeyInput(savedKey);
      fetchLiveData(savedKey);
    }
  }, []);

  const saveApiKey = () => {
    platformApi.setApiKey(apiKeyInput);
    setApiKey(apiKeyInput);
    fetchLiveData(apiKeyInput);
    setShowSettings(false);
  };

  const fetchLiveData = async (key?: string) => {
    setIsLoading(true);
    try {
      // Temporarily set the key for fetching
      if (key) platformApi.setApiKey(key);
      
      // Fetch account stats for all models
      const stats = await platformApi.getAllAccountsStats();
      setLiveStats(stats);

      // Fetch top spenders for each account
      const spenders: Record<string, Fan[]> = {};
      for (const [name, id] of Object.entries(ACCOUNT_IDS)) {
        spenders[name] = await platformApi.getTopSpenders(id, 5);
      }
      setTopSpenders(spenders);

      // Check if we got data
      const hasData = Object.values(stats).some(s => s !== null);
      setApiStatus(hasData ? 'connected' : 'error');
    } catch (e) {
      console.error('Failed to fetch live data:', e);
      setApiStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const getQualityBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-500">Excellent</Badge>;
    if (score >= 80) return <Badge className="bg-blue-500">Good</Badge>;
    if (score >= 70) return <Badge className="bg-yellow-500">Average</Badge>;
    return <Badge className="bg-red-500">Needs Improvement</Badge>;
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  if (!isAdmin) {
    return (
      <div className="glass-card p-8 rounded-lg text-center">
        <p className="text-muted-foreground">Revenue analytics are only available to admins.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Chatter Analytics</h2>
          <p className="text-muted-foreground">Track chatter performance and message revenue attribution</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={`px-4 py-2 ${apiStatus === 'connected' ? 'border-green-500 text-green-500' : apiStatus === 'error' ? 'border-red-500 text-red-500' : ''}`}
          >
            {apiStatus === 'connected' ? <Check className="h-4 w-4 mr-1" /> : apiStatus === 'error' ? <AlertCircle className="h-4 w-4 mr-1" /> : null}
            {apiStatus === 'connected' ? 'API Connected' : apiStatus === 'error' ? 'API Error' : 'Not Connected'}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => fetchLiveData()} disabled={isLoading || !apiKey}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* API Settings Panel */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">API Configuration</CardTitle>
            <CardDescription>Connect to OnlyFans API for live data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Enter API key (starts with ofapi_...)"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="flex-1"
              />
              <Button onClick={saveApiKey}>Save & Connect</Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Get your API key from app.onlyfansapi.com. The key is stored locally in your browser.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Live Account Stats */}
      {apiStatus === 'connected' && Object.keys(liveStats).length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Object.entries(liveStats).map(([name, stats]) => stats && (
            <Card key={name}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg capitalize">{name}</CardTitle>
                <CardDescription>{stats.subscribersCount?.toLocaleString()} subscribers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Posts</span>
                    <span>{stats.postsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Favorites</span>
                    <span>{stats.favoritesCount}</span>
                  </div>
                  {topSpenders[name]?.length > 0 && (
                    <div className="pt-2 border-t mt-2">
                      <span className="text-xs text-muted-foreground">Top Spender:</span>
                      <p className="font-medium">{topSpenders[name][0].name} - ${topSpenders[name][0].totalSpent}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Today's Shifts</TabsTrigger>
          <TabsTrigger value="performance">Chatter Performance</TabsTrigger>
          <TabsTrigger value="attribution">Revenue Attribution</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {todayShifts.map((shift) => (
              <Card key={`${shift.chatterId}-${shift.startTime}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{shift.chatterName}</CardTitle>
                    <Badge variant="secondary">{shift.model}</Badge>
                  </div>
                  <CardDescription>
                    {new Date(shift.startTime).toLocaleTimeString()} - {new Date(shift.endTime).toLocaleTimeString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Revenue</span>
                      <span className="font-bold text-green-600">{formatCurrency(shift.messageRevenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Messages</span>
                      <span>{shift.messageCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Conversion</span>
                      <span>{shift.conversionRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chatter Leaderboard (This Month)</CardTitle>
              <CardDescription>Ranked by total message revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performance.map((chatter, index) => (
                  <div key={chatter.chatterId} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-muted-foreground">#{index + 1}</span>
                      <div>
                        <p className="font-semibold">{chatter.chatterName}</p>
                        <p className="text-sm text-muted-foreground">Top model: {chatter.topModel}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(chatter.totalRevenue)}</p>
                        <p className="text-sm text-muted-foreground">{chatter.shiftsWorked} shifts</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(chatter.avgRevenuePerShift)}</p>
                        <p className="text-sm text-muted-foreground">avg/shift</p>
                      </div>
                      <div className="w-24">
                        {getQualityBadge(chatter.qualityScore)}
                        <Progress value={chatter.qualityScore} className="mt-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Attribution System</CardTitle>
              <CardDescription>
                1 chatter per model per shift = clear attribution for all message revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 rounded-lg border border-dashed">
                  <h4 className="font-semibold mb-2">How Attribution Works</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Each shift has exactly 1 chatter assigned per model</li>
                    <li>Platform API tracks all message revenue during that shift</li>
                    <li>Revenue is automatically attributed to the assigned chatter</li>
                    <li>Quality scores calculated based on conversion rates and average message value</li>
                  </ol>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Today's Message Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-green-600">$925.60</p>
                      <p className="text-xs text-muted-foreground">Across all models</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Active Chatters</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">2</p>
                      <p className="text-xs text-muted-foreground">Currently on shift</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Avg Conversion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">11.97%</p>
                      <p className="text-xs text-muted-foreground">Messages → Revenue</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
