import { useState, useEffect } from "react";
import { teamMembers, chatterColors } from "@/lib/mock-data";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, Upload, Send, Star, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isDemoUser } from "@/utils/demo";

const SHIFTS = [
  { label: "6AM - 2PM", value: "06-14" },
  { label: "2PM - 10PM", value: "14-22" },
  { label: "10PM - 6AM", value: "22-06" },
];

const MODELS = ["Ashley", "Willow", "Izzie"];

interface ChatReview {
  id: string;
  fanName: string;
  model: string;
  score: number;
  wentWrong: string;
  wentRight: string;
  screenshotUrls: string[];
  screenshotFiles: File[];
  screenshotPreviews: string[];
  voiceFile: File | null;
  voicePreview: string;
}

function newChatReview(): ChatReview {
  return {
    id: crypto.randomUUID(),
    fanName: "",
    model: "",
    score: 5,
    wentWrong: "",
    wentRight: "",
    screenshotUrls: [],
    screenshotFiles: [],
    screenshotPreviews: [],
    voiceFile: null,
    voicePreview: "",
  };
}

export default function QCInput() {
  const { user } = useAuth();
  const isDemo = isDemoUser(user?.role);
  const chatters = teamMembers.filter((m) => m.role.toLowerCase() === "chatter" || m.category === "chatter");

  const [selectedChatter, setSelectedChatter] = useState("");
  const [selectedShift, setSelectedShift] = useState("");
  const [shiftDate, setShiftDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [reviews, setReviews] = useState<ChatReview[]>([newChatReview(), newChatReview(), newChatReview(), newChatReview(), newChatReview()]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [pendingRecovery, setPendingRecovery] = useState<any[]>([]);
  const [recovering, setRecovering] = useState(false);

  // Check for unsaved localStorage submissions on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("qc_submissions") || "[]");
      if (saved.length > 0) {
        setPendingRecovery(saved);
      }
    } catch {}
  }, []);

  const recoverSubmissions = async () => {
    setRecovering(true);
    let recovered = 0;
    for (const sub of pendingRecovery) {
      try {
        const { error } = await supabase.from("quality_scores").insert({
          chatter_name: sub.chatter_name,
          shift_date: sub.shift_date,
          overall_score: sub.overall_score,
          response_time_score: sub.overall_score,
          personalisation_score: sub.overall_score,
          conversation_flow_score: sub.overall_score,
          ppv_timing_score: sub.overall_score,
          energy_tone_score: sub.overall_score,
          notes: sub.reviews?.map((r: any) => `[${r.model || "?"} - ${r.fan_name}] ${r.score}/10\n✅ ${r.went_right || "N/A"}\n❌ ${r.went_wrong || "N/A"}`).join("\n\n") || "",
          reviewed_by: sub.reviewer || "unknown",
        });
        if (!error) recovered++;
      } catch {}
    }
    if (recovered > 0) {
      localStorage.removeItem("qc_submissions");
      setPendingRecovery([]);
      toast.success(`Recovered ${recovered} submission(s) to database!`);
    } else {
      toast.error("Failed to recover — data may be corrupted");
    }
    setRecovering(false);
  };

  const avgScore = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.score, 0) / reviews.length).toFixed(1)
    : "0.0";

  const addReview = () => {
    if (reviews.length >= 15) {
      toast.error("Maximum 15 chat reviews per submission");
      return;
    }
    setReviews([...reviews, newChatReview()]);
  };

  const removeReview = (id: string) => {
    if (reviews.length <= 1) return;
    setReviews(reviews.filter((r) => r.id !== id));
  };

  const updateReview = (id: string, field: keyof ChatReview, value: any) => {
    setReviews(reviews.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handleScreenshot = (id: string, files: FileList) => {
    const newFiles = Array.from(files);
    const newPreviews = newFiles.map(f => URL.createObjectURL(f));
    setReviews(
      reviews.map((r) =>
        r.id === id ? { 
          ...r, 
          screenshotFiles: [...r.screenshotFiles, ...newFiles],
          screenshotPreviews: [...r.screenshotPreviews, ...newPreviews]
        } : r
      )
    );
  };

  const removeScreenshot = (reviewId: string, index: number) => {
    setReviews(
      reviews.map((r) =>
        r.id === reviewId ? {
          ...r,
          screenshotFiles: r.screenshotFiles.filter((_, i) => i !== index),
          screenshotPreviews: r.screenshotPreviews.filter((_, i) => i !== index),
        } : r
      )
    );
  };

  const uploadScreenshot = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `qc-screenshots/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const { error } = await supabase.storage.from("qc-uploads").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("qc-uploads").getPublicUrl(path);
    return data.publicUrl;
  };

  const uploadScreenshots = async (files: File[]): Promise<string[]> => {
    return Promise.all(files.map(f => uploadScreenshot(f).catch(() => "")));
  };

  const handleSubmit = async () => {
    if (!selectedChatter || !selectedShift) {
      toast.error("Select a chatter and shift first");
      return;
    }
    if (reviews.length < 5) {
      toast.error(`Need at least 5 chat reviews (currently ${reviews.length})`);
      return;
    }
    if (reviews.some((r) => !r.fanName.trim())) {
      toast.error("Every chat review needs a fan name");
      return;
    }

    setSubmitting(true);
    try {
      // Upload screenshots
      const uploadedReviews = await Promise.all(
        reviews.map(async (r) => {
          let urls = r.screenshotUrls;
          if (r.screenshotFiles.length > 0) {
            try {
              urls = await uploadScreenshots(r.screenshotFiles);
            } catch (e) {
              console.error("Screenshot upload failed:", e);
            }
          }
          return { ...r, screenshotUrls: urls };
        })
      );

      const chatterObj = chatters.find((c) => c.id === selectedChatter);
      const overallScore = parseFloat(avgScore);

      // Save to qc_submissions table (we'll create this)
      // For now, save to scorecards + local storage as backup
      const submissionData = {
        chatter_name: chatterObj?.name || selectedChatter,
        shift: selectedShift,
        shift_date: shiftDate,
        overall_score: overallScore,
        reviewer: user?.displayName || "Unknown",
        reviews: uploadedReviews.map((r) => ({
          fan_name: r.fanName,
          model: r.model,
          score: r.score,
          went_right: r.wentRight,
          went_wrong: r.wentWrong,
          screenshot_urls: r.screenshotUrls,
        })),
        submitted_at: new Date().toISOString(),
      };

      // Save to quality_scores table
      const { error: scoreError } = await supabase.from("quality_scores").insert({
        chatter_name: chatterObj?.name || selectedChatter,
        shift_date: shiftDate,
        overall_score: overallScore,
        response_time_score: overallScore,
        personalisation_score: overallScore,
        conversation_flow_score: overallScore,
        ppv_timing_score: overallScore,
        energy_tone_score: overallScore,
        notes: uploadedReviews.map((r) => `[${r.model || "?"} - ${r.fanName}] ${r.score}/10\n✅ ${r.wentRight || "N/A"}\n❌ ${r.wentWrong || "N/A"}`).join("\n\n"),
        reviewed_by: user?.displayName || user?.username || "unknown",
      });

      if (scoreError) {
        console.error("Scorecard save error:", scoreError);
        // Still save locally as backup
      }

      // Also save full submission to localStorage as backup
      const existing = JSON.parse(localStorage.getItem("qc_submissions") || "[]");
      existing.push(submissionData);
      localStorage.setItem("qc_submissions", JSON.stringify(existing));

      toast.success(`QC submitted! ${chatterObj?.name} scored ${overallScore}/10 across ${reviews.length} chats`);
      setSubmitted(true);
    } catch (e: any) {
      toast.error("Failed to submit: " + (e.message || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setReviews([newChatReview()]);
    setSelectedChatter("");
    setSelectedShift("");
    setSubmitted(false);
  };

  const getScoreColor = (score: number) => {
    if (score <= 3) return "text-red-400";
    if (score <= 5) return "text-orange-400";
    if (score <= 7) return "text-yellow-400";
    return "text-green-400";
  };

  const getScoreBg = (score: number) => {
    if (score <= 3) return "bg-red-500/20 border-red-500/30";
    if (score <= 5) return "bg-orange-500/20 border-orange-500/30";
    if (score <= 7) return "bg-yellow-500/20 border-yellow-500/30";
    return "bg-green-500/20 border-green-500/30";
  };

  if (submitted) {
    const chatterObj = chatters.find((c) => c.id === selectedChatter);
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <Card className="glass-card border-green-500/30 bg-green-500/5">
          <CardContent className="p-8 text-center space-y-4">
            <div className="text-5xl">✅</div>
            <h2 className="text-2xl font-bold text-green-400">QC Submitted</h2>
            <p className="text-muted-foreground">
              {chatterObj?.name} — {selectedShift} shift on {shiftDate}
            </p>
            <p className="text-3xl font-black">
              <span className={getScoreColor(parseFloat(avgScore))}>{avgScore}/10</span>
            </p>
            <p className="text-sm text-muted-foreground">{reviews.length} chats reviewed</p>
            <Button onClick={resetForm} className="mt-4">Submit Another QC</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quality Check Input</h1>
          <p className="text-muted-foreground text-sm">Review individual chats, score them, auto-calculate overall shift score</p>
        </div>
        <div className={`text-4xl font-black ${getScoreColor(parseFloat(avgScore))}`}>
          {avgScore}<span className="text-lg text-muted-foreground">/10</span>
        </div>
      </div>

      {/* Recovery Banner */}
      {pendingRecovery.length > 0 && (
        <Card className="glass-card border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-yellow-400">⚠️ {pendingRecovery.length} unsaved QC submission(s) found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {pendingRecovery.map((s: any) => `${s.chatter_name} (${s.overall_score}/10)`).join(", ")}
                </p>
              </div>
              <Button onClick={recoverSubmissions} disabled={recovering} className="bg-yellow-500 hover:bg-yellow-600 text-black">
                {recovering ? "Recovering..." : "Save to Database"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chatter + Shift Selection */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Chatter</label>
              <Select value={selectedChatter} onValueChange={setSelectedChatter}>
                <SelectTrigger><SelectValue placeholder="Select chatter" /></SelectTrigger>
                <SelectContent>
                  {chatters.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Shift</label>
              <Select value={selectedShift} onValueChange={setSelectedShift}>
                <SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger>
                <SelectContent>
                  {SHIFTS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Date</label>
              <Input type="date" value={shiftDate} onChange={(e) => setShiftDate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Chat Reviews */}
      <div className="space-y-4">
        {reviews.map((review, idx) => (
          <Card key={review.id} className={`glass-card border ${getScoreBg(review.score)}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  Chat #{idx + 1}
                  {review.fanName && ` — ${review.fanName}`}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-black ${getScoreColor(review.score)}`}>
                    {review.score}/10
                  </span>
                  {reviews.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeReview(review.id)} className="h-7 w-7 text-red-400 hover:text-red-300">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Fan Name</label>
                  <Input
                    placeholder="e.g. Matteo"
                    value={review.fanName}
                    onChange={(e) => updateReview(review.id, "fanName", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Model</label>
                  <Select value={review.model} onValueChange={(v) => updateReview(review.id, "model", v)}>
                    <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
                    <SelectContent>
                      {MODELS.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Score selector */}
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Score</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <button
                      key={n}
                      onClick={() => updateReview(review.id, "score", n)}
                      className={`flex-1 py-2 rounded text-sm font-bold transition-all ${
                        review.score === n
                          ? n <= 3 ? "bg-red-500 text-white"
                            : n <= 5 ? "bg-orange-500 text-white"
                            : n <= 7 ? "bg-yellow-500 text-black"
                            : "bg-green-500 text-white"
                          : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* What went right / wrong */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-green-400 mb-1 block">✅ What went right</label>
                  <Textarea
                    placeholder="e.g. Good rapport building, asked fan questions, natural conversation"
                    value={review.wentRight}
                    onChange={(e) => updateReview(review.id, "wentRight", e.target.value)}
                    rows={2}
                    className="border-green-500/20 focus:border-green-500/40"
                  />
                </div>
                <div>
                  <label className="text-xs text-red-400 mb-1 block">❌ What went wrong</label>
                  <Textarea
                    placeholder="e.g. Rushed to PPV, didn't build rapport, guilt tripped the fan"
                    value={review.wentWrong}
                    onChange={(e) => updateReview(review.id, "wentWrong", e.target.value)}
                    rows={2}
                    className="border-red-500/20 focus:border-red-500/40"
                  />
                </div>
              </div>

              {/* Voice note */}
              <div>
                {review.voicePreview ? (
                  <div className="flex items-center gap-2">
                    <audio src={review.voicePreview} controls className="h-8 flex-1" />
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400" onClick={() => {
                      updateReview(review.id, "voiceFile", null);
                      updateReview(review.id, "voicePreview", "");
                    }}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-muted-foreground/30 cursor-pointer hover:border-primary/50 transition-colors">
                    <span className="text-sm">🎙️</span>
                    <span className="text-xs text-muted-foreground">Add voice note</span>
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          updateReview(review.id, "voiceFile", f);
                          updateReview(review.id, "voicePreview", URL.createObjectURL(f));
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Screenshot/video upload */}
              <div>
                {review.screenshotPreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {review.screenshotPreviews.map((preview, idx) => (
                      <div key={idx} className="relative">
                        {review.screenshotFiles[idx]?.type?.startsWith("video/") ? (
                          <video src={preview} controls className="rounded-lg h-24 w-24 object-cover" />
                        ) : (
                          <img src={preview} alt={`Screenshot ${idx + 1}`} className="rounded-lg h-24 w-24 object-cover" />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -top-1 -right-1 h-5 w-5 bg-black/80 hover:bg-red-600"
                          onClick={() => removeScreenshot(review.id, idx)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-muted-foreground/30 cursor-pointer hover:border-primary/50 transition-colors">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {review.screenshotPreviews.length > 0 ? `Add more (${review.screenshotPreviews.length} uploaded)` : "Upload screenshots/videos"}
                  </span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleScreenshot(review.id, e.target.files);
                      }
                    }}
                  />
                </label>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add + Submit */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={addReview} className="flex-1">
          <Plus className="h-4 w-4 mr-2" /> Add Chat ({reviews.length}/15)
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting || !selectedChatter || !selectedShift}
          className="flex-1 bg-primary"
        >
          {submitting ? "Submitting..." : (
            <>
              <Send className="h-4 w-4 mr-2" /> Submit QC ({avgScore}/10)
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
