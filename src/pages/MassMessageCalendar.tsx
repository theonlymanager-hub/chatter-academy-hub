import { useState, useMemo } from "react";
import { massMessages, modelColors } from "@/lib/mock-data";
import { ChevronLeft, ChevronRight, DollarSign, MessageSquare } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const modelNames = ["Izzy", "Willow", "Lucinda Bleu", "Ashley Morris"];

export default function MassMessageCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 1)); // March 2026
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    // Offset for starting day (Mon-based: shift Sun to end)
    const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    for (let i = 0; i < offset; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [daysInMonth, firstDayOfWeek]);

  const getDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const getMessagesForDay = (day: number) =>
    massMessages.filter((m) => m.date === getDateStr(day));

  const selectedMessages = selectedDate
    ? massMessages.filter((m) => m.date === selectedDate)
    : [];

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const monthName = currentMonth.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mass Message Calendar</h1>
        <p className="text-muted-foreground text-sm mt-1">Monthly view of scheduled mass messages by model</p>
      </div>

      <div className="glass-card p-5">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="text-lg font-semibold">{monthName}</h2>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} />;
            const msgs = getMessagesForDay(day);
            const dateStr = getDateStr(day);
            const isSelected = selectedDate === dateStr;
            const isToday = dateStr === "2026-03-04";

            return (
              <Tooltip key={day}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                    className={`min-h-[72px] p-1.5 rounded-lg border transition-all text-left flex flex-col ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : isToday
                        ? "border-primary/50 bg-primary/5"
                        : msgs.length > 0
                        ? "border-border/50 bg-secondary/30 hover:bg-secondary/60"
                        : "border-transparent hover:border-border/30"
                    }`}
                  >
                    <span className={`text-xs font-medium mb-1 ${isToday ? "text-primary" : ""}`}>{day}</span>
                    <div className="flex flex-wrap gap-0.5">
                      {msgs.map((m) => (
                        <div
                          key={m.id}
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: `hsl(${modelColors[m.modelName]})` }}
                        />
                      ))}
                    </div>
                  </button>
                </TooltipTrigger>
                {msgs.length > 0 && (
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-1.5">
                      {msgs.map((m) => (
                        <div key={m.id} className="text-xs">
                          <span className="font-medium" style={{ color: `hsl(${modelColors[m.modelName]})` }}>
                            {m.modelName}
                          </span>
                          <span className="text-muted-foreground ml-1">— {m.messagePreview}</span>
                        </div>
                      ))}
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDate && selectedMessages.length > 0 && (
        <div className="glass-card p-5 space-y-3">
          <h3 className="font-semibold text-sm">
            Messages for {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </h3>
          <div className="space-y-2">
            {selectedMessages.map((m) => {
              const color = modelColors[m.modelName];
              return (
                <div
                  key={m.id}
                  className="p-3 rounded-lg border flex items-start gap-3"
                  style={{ borderColor: `hsl(${color} / 0.3)`, backgroundColor: `hsl(${color} / 0.05)` }}
                >
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                    style={{ backgroundColor: `hsl(${color} / 0.2)`, color: `hsl(${color})` }}
                  >
                    {m.modelName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: `hsl(${color})` }}>{m.modelName}</span>
                      <span className="text-[10px] text-muted-foreground">({m.theme})</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {m.messagePreview}
                    </p>
                    <p className="text-xs mt-1 flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-accent" />
                      <span className="text-accent font-medium">{m.ppvTitle} — ${m.ppvPrice}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-4 flex-wrap">
        {modelNames.map((name) => (
          <div key={name} className="flex items-center gap-2 text-xs">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: `hsl(${modelColors[name]})` }} />
            <span className="text-muted-foreground">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
