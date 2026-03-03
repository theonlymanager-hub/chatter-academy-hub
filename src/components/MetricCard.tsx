import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
}

export function MetricCard({ title, value, change, changeType = "neutral", icon: Icon }: MetricCardProps) {
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{title}</span>
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {change && (
          <p className={`text-xs mt-1 ${changeType === "positive" ? "text-success" : changeType === "negative" ? "text-destructive" : "text-muted-foreground"}`}>
            {change}
          </p>
        )}
      </div>
    </div>
  );
}
