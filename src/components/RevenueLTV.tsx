import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Users, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ModelLTV {
  name: string;
  weeklyRevenue: number;
  totalRevenue: number;
  subscribers: number;
  ltv: number;
  target: number;
}

const LTV_TARGET = 7;

// Real data from OF API (updated 2026-03-29 22:44)
const REAL_DATA: ModelLTV[] = [
  { name: 'Ashley', weeklyRevenue: 3666, totalRevenue: 47655, subscribers: 9393, ltv: 1.56, target: LTV_TARGET },
  { name: 'Izzie', weeklyRevenue: 1742, totalRevenue: 53631, subscribers: 11365, ltv: 0.61, target: LTV_TARGET },
  { name: 'Willow', weeklyRevenue: 384, totalRevenue: 12364, subscribers: 1454, ltv: 1.06, target: LTV_TARGET },
];

export default function RevenueLTV() {
  const [models] = useState<ModelLTV[]>(REAL_DATA);
  const weeklyTotal = REAL_DATA.reduce((sum, m) => sum + m.weeklyRevenue, 0);
  const weeklyTarget = 5000;

  function getLTVColor(ltv: number): string {
    if (ltv >= 7) return 'text-green-500';
    if (ltv >= 4) return 'text-yellow-500';
    return 'text-red-500';
  }

  function getLTVBadge(ltv: number): 'default' | 'secondary' | 'destructive' {
    if (ltv >= 7) return 'default';
    if (ltv >= 4) return 'secondary';
    return 'destructive';
  }

  const targetProgress = Math.min((weeklyTotal / weeklyTarget) * 100, 100);

  return (
    <div className="space-y-4">
      {/* Weekly Revenue Target */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            Weekly Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">${weeklyTotal.toLocaleString()}</span>
            <span className="text-muted-foreground text-sm">/ ${weeklyTarget.toLocaleString()} target</span>
          </div>
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${targetProgress >= 100 ? 'bg-green-500' : targetProgress >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${targetProgress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">{targetProgress.toFixed(0)}% of weekly target</p>
        </CardContent>
      </Card>

      {/* Per-Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {models.map((model) => (
          <Card key={model.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {model.name}
                </span>
                <Badge variant={getLTVBadge(model.ltv)}>
                  ${model.ltv.toFixed(2)} LTV
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Weekly Rev
                </span>
                <span className="font-medium">${model.weeklyRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" /> Subscribers
                </span>
                <span className="font-medium">{model.subscribers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">LTV vs Target</span>
                <span className={`font-medium ${getLTVColor(model.ltv)}`}>
                  ${model.ltv.toFixed(2)} / ${model.target.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
