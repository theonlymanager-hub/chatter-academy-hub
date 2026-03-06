import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { onlyfansApi, EarningStats, Transaction } from '@/services/onlyfansApi';

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

// Mock data for demo - will be replaced with real API data
const mockShifts: ChatterShift[] = [
  { chatterId: '1', chatterName: 'Jane', model: 'Izzie', startTime: '2026-03-06T09:00:00', endTime: '2026-03-06T15:00:00', messageRevenue: 245.50, messageCount: 42, conversionRate: 12.5 },
  { chatterId: '2', chatterName: 'Kenneth', model: 'Lucinda', startTime: '2026-03-06T15:00:00', endTime: '2026-03-06T21:00:00', messageRevenue: 189.20, messageCount: 38, conversionRate: 10.2 },
  { chatterId: '3', chatterName: 'Jaydee', model: 'Willow', startTime: '2026-03-06T09:00:00', endTime: '2026-03-06T15:00:00', messageRevenue: 312.00, messageCount: 56, conversionRate: 15.8 },
  { chatterId: '4', chatterName: 'Jemimah', model: 'Izzie', startTime: '2026-03-06T21:00:00', endTime: '2026-03-07T03:00:00', messageRevenue: 178.90, messageCount: 31, conversionRate: 9.4 },
];

const mockPerformance: ChatterPerformance[] = [
  { chatterId: '3', chatterName: 'Jaydee', totalRevenue: 4520.00, avgRevenuePerShift: 301.33, shiftsWorked: 15, qualityScore: 92, topModel: 'Willow' },
  { chatterId: '1', chatterName: 'Jane', totalRevenue: 3890.50, avgRevenuePerShift: 259.37, shiftsWorked: 15, qualityScore: 88, topModel: 'Izzie' },
  { chatterId: '2', chatterName: 'Kenneth', totalRevenue: 3245.20, avgRevenuePerShift: 216.35, shiftsWorked: 15, qualityScore: 82, topModel: 'Lucinda' },
  { chatterId: '4', chatterName: 'Jemimah', totalRevenue: 2890.00, avgRevenuePerShift: 192.67, shiftsWorked: 15, qualityScore: 78, topModel: 'Izzie' },
];

export default function ChatterAnalytics() {
  const [isLoading, setIsLoading] = useState(false);
  const [todayShifts, setTodayShifts] = useState<ChatterShift[]>(mockShifts);
  const [performance, setPerformance] = useState<ChatterPerformance[]>(mockPerformance);
  const [totalEarnings, setTotalEarnings] = useState<EarningStats | null>(null);

  const getQualityBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-500">Excellent</Badge>;
    if (score >= 80) return <Badge className="bg-blue-500">Good</Badge>;
    if (score >= 70) return <Badge className="bg-yellow-500">Average</Badge>;
    return <Badge className="bg-red-500">Needs Improvement</Badge>;
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Chatter Analytics</h2>
          <p className="text-muted-foreground">Track chatter performance and message revenue attribution</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Live Data via OnlyFansAPI
        </Badge>
      </div>

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
                    <li>OnlyFansAPI tracks all message revenue during that shift</li>
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
