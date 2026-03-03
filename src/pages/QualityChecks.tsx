import { useState } from "react";
import { teamMembers } from "@/lib/mock-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

const categories = ["Response Quality", "Upsell Technique", "Tone & Personality", "Revenue Impact", "Subscriber Retention"];

export default function QualityChecks() {
  const [selectedMember, setSelectedMember] = useState("");
  const [scores, setScores] = useState<Record<string, number>>(Object.fromEntries(categories.map((c) => [c, 5])));
  const [notes, setNotes] = useState("");

  const avgScore = (Object.values(scores).reduce((a, b) => a + b, 0) / categories.length).toFixed(1);

  const handleSubmit = () => {
    if (!selectedMember) {
      toast.error("Please select a team member");
      return;
    }
    toast.success(`Quality check submitted for ${teamMembers.find((m) => m.id === selectedMember)?.name}`);
    setSelectedMember("");
    setScores(Object.fromEntries(categories.map((c) => [c, 5])));
    setNotes("");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Quality Checks</h1>
        <p className="text-muted-foreground text-sm mt-1">Score chatter performance</p>
      </div>

      <div className="glass-card p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Team Member</label>
          <Select value={selectedMember} onValueChange={setSelectedMember}>
            <SelectTrigger className="bg-secondary/50">
              <SelectValue placeholder="Select a team member" />
            </SelectTrigger>
            <SelectContent>
              {teamMembers.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.name} — {m.role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-5">
          {categories.map((category) => (
            <div key={category} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm">{category}</label>
                <span className={`text-sm font-bold ${scores[category] >= 8 ? "text-success" : scores[category] >= 5 ? "text-warning" : "text-destructive"}`}>
                  {scores[category]}/10
                </span>
              </div>
              <Slider
                value={[scores[category]]}
                onValueChange={([v]) => setScores((s) => ({ ...s, [category]: v }))}
                min={1}
                max={10}
                step={1}
                className="py-1"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 py-3">
          <span className="text-sm text-muted-foreground">Average Score:</span>
          <span className={`text-3xl font-bold ${Number(avgScore) >= 8 ? "text-success" : Number(avgScore) >= 5 ? "text-warning" : "text-destructive"}`}>
            {avgScore}
          </span>
          <span className="text-sm text-muted-foreground">/10</span>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Notes & Feedback</label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add coaching notes, areas for improvement, positive highlights..." className="bg-secondary/50 min-h-[100px]" />
        </div>

        <Button onClick={handleSubmit} className="w-full">Submit Quality Check</Button>
      </div>
    </div>
  );
}
