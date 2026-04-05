import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, DollarSign, MessageSquare, TrendingUp } from "lucide-react";

export default function Data() {
  const [stats, setStats] = useState({
    newSubs: 0,
    totalRevenue: 0,
    ppvSales: 0,
    messages: 0
  });

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  async function loadStats() {
    const today = new Date().toISOString().split('T')[0];
    
    // New subs today
    const { count: newSubs } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .gte('subscribed_at', today);
    
    // PPV revenue today
    const { data: ppvData } = await supabase
      .from('ppv_sales')
      .select('amount')
      .gte('unlocked_at', today);
    
    const totalRevenue = ppvData?.reduce((sum, s) => sum + s.amount, 0) || 0;
    const ppvSales = ppvData?.length || 0;
    
    // Messages today
    const { count: messages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .gte('received_at', today);
    
    setStats({ newSubs: newSubs || 0, totalRevenue, ppvSales, messages: messages || 0 });
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Live Data</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New Subs Today</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newSubs}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">PPV Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">PPV Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ppvSales}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.messages}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
