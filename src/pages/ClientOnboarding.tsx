import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Rocket,
  CheckCircle2,
  Clock,
  Circle,
  Trash2,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────

type ItemStatus = "not_started" | "in_progress" | "done";

interface ChecklistItem {
  id: string;
  label: string;
  status: ItemStatus;
  assignee: string;
  completedDate: string | null;
  notes: string;
}

interface OnboardingClient {
  id: string;
  name: string;
  createdAt: string;
  checklist: ChecklistItem[];
}

// ── Constants ──────────────────────────────────────────────────────────

const TEAM_MEMBERS = ["Luke", "Doug", "Mateo", "Elle", "Zar", "Mark"];

const DEFAULT_CHECKLIST_TEMPLATES: { label: string; defaultAssignee: string }[] = [
  { label: "Contract signed", defaultAssignee: "Luke" },
  { label: "Telegram contact received (Luke → Supervisor)", defaultAssignee: "Luke" },
  { label: "Account created and added to platform", defaultAssignee: "Luke" },
  { label: "Profile picture uploaded", defaultAssignee: "Doug" },
  { label: "Bio written and set", defaultAssignee: "Doug" },
  { label: "Welcome message configured", defaultAssignee: "Doug" },
  { label: "Content ideas list sent to client", defaultAssignee: "Luke" },
  { label: "Content received from client (quality checked)", defaultAssignee: "Luke" },
  { label: "Content uploaded to account vault", defaultAssignee: "Doug" },
  { label: "Scripts set up for this model (personality, tone, key phrases)", defaultAssignee: "Mateo" },
  { label: "Model fact sheet created (age, location, backstory, interests, what NOT to say)", defaultAssignee: "Mateo" },
  { label: "Fan profiles / notes template ready", defaultAssignee: "Mateo" },
  { label: "Scenario Board populated for this model", defaultAssignee: "Mateo" },
  { label: "Chatters briefed on the model", defaultAssignee: "Luke" },
  { label: "Chatters assigned shifts on the account", defaultAssignee: "Luke" },
  { label: "Test messages sent (quality check welcome flow)", defaultAssignee: "Doug" },
  { label: "LIVE — ready for subscribers", defaultAssignee: "Luke" },
];

const STORAGE_KEY = "onlyboard_client_onboarding";

// ── Helpers ────────────────────────────────────────────────────────────

function generateId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function buildChecklist(): ChecklistItem[] {
  return DEFAULT_CHECKLIST_TEMPLATES.map((t, i) => ({
    id: `item-${i}-${generateId()}`,
    label: t.label,
    status: "not_started" as ItemStatus,
    assignee: t.defaultAssignee,
    completedDate: null,
    notes: "",
  }));
}

function getProgress(checklist: ChecklistItem[]): number {
  if (!checklist.length) return 0;
  const done = checklist.filter((c) => c.status === "done").length;
  return Math.round((done / checklist.length) * 100);
}

function progressColor(pct: number): string {
  if (pct < 30) return "bg-red-500";
  if (pct <= 70) return "bg-yellow-500";
  return "bg-emerald-500";
}

function progressBorder(pct: number): string {
  if (pct < 30) return "border-red-500/30";
  if (pct <= 70) return "border-yellow-500/30";
  return "border-emerald-500/30";
}

function statusIcon(status: ItemStatus) {
  if (status === "done") return <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />;
  if (status === "in_progress") return <Clock className="h-4 w-4 text-yellow-400 shrink-0" />;
  return <Circle className="h-4 w-4 text-slate-500 shrink-0" />;
}

function statusLabel(status: ItemStatus) {
  if (status === "done") return "Done";
  if (status === "in_progress") return "In Progress";
  return "Not Started";
}

// ── Component ──────────────────────────────────────────────────────────

export default function ClientOnboarding() {
  const { user } = useAuth();
  const isPrivileged = user && (user.role === "admin" || user.role === "supervisor");

  const [clients, setClients] = useState<OnboardingClient[]>([]);
  const [filter, setFilter] = useState<"all" | "in_progress" | "complete">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newClientName, setNewClientName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setClients(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  // Persist to localStorage
  const persist = useCallback((updated: OnboardingClient[]) => {
    setClients(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  // ── Actions ────────────────────────────────────────────────────────

  const addClient = () => {
    const name = newClientName.trim();
    if (!name) return;
    const client: OnboardingClient = {
      id: generateId(),
      name,
      createdAt: new Date().toISOString(),
      checklist: buildChecklist(),
    };
    persist([client, ...clients]);
    setNewClientName("");
    setDialogOpen(false);
    setExpandedId(client.id);
  };

  const deleteClient = (id: string) => {
    persist(clients.filter((c) => c.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const updateItem = (
    clientId: string,
    itemId: string,
    patch: Partial<ChecklistItem>
  ) => {
    persist(
      clients.map((c) => {
        if (c.id !== clientId) return c;
        return {
          ...c,
          checklist: c.checklist.map((item) => {
            if (item.id !== itemId) return item;
            const updated = { ...item, ...patch };
            // Auto-set completed date
            if (patch.status === "done" && !updated.completedDate) {
              updated.completedDate = new Date().toISOString().slice(0, 10);
            }
            if (patch.status && patch.status !== "done") {
              updated.completedDate = null;
            }
            return updated;
          }),
        };
      })
    );
  };

  // ── Filtering ──────────────────────────────────────────────────────

  const filtered = clients.filter((c) => {
    if (filter === "all") return true;
    const pct = getProgress(c.checklist);
    if (filter === "complete") return pct === 100;
    return pct > 0 && pct < 100;
  });

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Rocket className="h-6 w-6 text-cyan-400" />
            Client Onboarding Pipeline
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track onboarding progress for new clients/models
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter */}
          <Select
            value={filter}
            onValueChange={(v) => setFilter(v as typeof filter)}
          >
            <SelectTrigger className="w-[160px] bg-slate-800/60 border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
            </SelectContent>
          </Select>

          {/* Add client */}
          {isPrivileged && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-cyan-600 hover:bg-cyan-700">
                  <Plus className="h-4 w-4 mr-1" /> New Client
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700">
                <DialogHeader>
                  <DialogTitle>Add New Client</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <Input
                    placeholder="Client / Model name"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addClient()}
                    className="bg-slate-800 border-slate-700"
                    autoFocus
                  />
                  <Button onClick={addClient} className="w-full bg-cyan-600 hover:bg-cyan-700">
                    Create Client
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: clients.length, color: "text-slate-300" },
          {
            label: "Not Started",
            value: clients.filter((c) => getProgress(c.checklist) === 0).length,
            color: "text-red-400",
          },
          {
            label: "In Progress",
            value: clients.filter((c) => {
              const p = getProgress(c.checklist);
              return p > 0 && p < 100;
            }).length,
            color: "text-yellow-400",
          },
          {
            label: "Complete",
            value: clients.filter((c) => getProgress(c.checklist) === 100).length,
            color: "text-emerald-400",
          },
        ].map((s) => (
          <Card key={s.label} className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Client cards */}
      {filtered.length === 0 && (
        <div className="text-center text-muted-foreground py-16">
          {clients.length === 0
            ? "No clients yet. Click \"New Client\" to start onboarding."
            : "No clients match this filter."}
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((client) => {
          const pct = getProgress(client.checklist);
          const doneCount = client.checklist.filter((i) => i.status === "done").length;
          const expanded = expandedId === client.id;

          return (
            <Card
              key={client.id}
              className={`bg-slate-800/50 border ${progressBorder(pct)} transition-colors`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center gap-3 cursor-pointer flex-1"
                    onClick={() => setExpandedId(expanded ? null : client.id)}
                  >
                    {expanded ? (
                      <ChevronUp className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    )}
                    <div>
                      <CardTitle className="text-lg">{client.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Added {new Date(client.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={
                        pct === 100
                          ? "border-emerald-500 text-emerald-400"
                          : pct === 0
                          ? "border-red-500 text-red-400"
                          : "border-yellow-500 text-yellow-400"
                      }
                    >
                      {pct === 100 ? "✅ LIVE" : pct === 0 ? "Not Started" : "In Progress"}
                    </Badge>
                    <span className="text-sm font-mono text-slate-300 w-20 text-right">
                      {doneCount}/{client.checklist.length}
                    </span>
                    {isPrivileged && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-500 hover:text-red-400 h-8 w-8"
                        onClick={() => deleteClient(client.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Progress</span>
                    <span
                      className={`text-xs font-bold ${
                        pct < 30
                          ? "text-red-400"
                          : pct <= 70
                          ? "text-yellow-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {pct}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${progressColor(pct)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </CardHeader>

              {/* Expanded checklist */}
              {expanded && (
                <CardContent className="pt-0 space-y-2">
                  <div className="border-t border-slate-700/50 pt-4 space-y-2">
                    {client.checklist.map((item, idx) => (
                      <div
                        key={item.id}
                        className={`rounded-lg p-3 transition-colors ${
                          item.status === "done"
                            ? "bg-emerald-950/20 border border-emerald-800/30"
                            : item.status === "in_progress"
                            ? "bg-yellow-950/20 border border-yellow-800/30"
                            : "bg-slate-900/50 border border-slate-700/30"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Step number + icon */}
                          <div className="flex items-center gap-2 pt-0.5 shrink-0">
                            <span className="text-xs text-slate-500 font-mono w-5 text-right">
                              {idx + 1}.
                            </span>
                            {statusIcon(item.status)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 space-y-2">
                            <p
                              className={`text-sm ${
                                item.status === "done"
                                  ? "text-slate-400 line-through"
                                  : "text-slate-200"
                              }`}
                            >
                              {item.label}
                            </p>

                            {/* Controls row */}
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Status */}
                              <Select
                                value={item.status}
                                onValueChange={(v) =>
                                  updateItem(client.id, item.id, {
                                    status: v as ItemStatus,
                                  })
                                }
                              >
                                <SelectTrigger className="h-7 w-[130px] text-xs bg-slate-800 border-slate-700">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="not_started">Not Started</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="done">Done</SelectItem>
                                </SelectContent>
                              </Select>

                              {/* Assignee */}
                              <Select
                                value={item.assignee}
                                onValueChange={(v) =>
                                  updateItem(client.id, item.id, { assignee: v })
                                }
                              >
                                <SelectTrigger className="h-7 w-[110px] text-xs bg-slate-800 border-slate-700">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {TEAM_MEMBERS.map((m) => (
                                    <SelectItem key={m} value={m}>
                                      {m}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              {/* Completed date */}
                              {item.status === "done" && (
                                <Input
                                  type="date"
                                  value={item.completedDate || ""}
                                  onChange={(e) =>
                                    updateItem(client.id, item.id, {
                                      completedDate: e.target.value || null,
                                    })
                                  }
                                  className="h-7 w-[140px] text-xs bg-slate-800 border-slate-700"
                                />
                              )}
                            </div>

                            {/* Notes */}
                            <Textarea
                              placeholder="Notes..."
                              value={item.notes}
                              onChange={(e) =>
                                updateItem(client.id, item.id, { notes: e.target.value })
                              }
                              className="min-h-[32px] h-8 text-xs bg-slate-800/50 border-slate-700/50 resize-none focus:min-h-[60px] transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
