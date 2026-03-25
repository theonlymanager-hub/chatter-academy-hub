import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Trophy, TrendingUp, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface QuizResult {
  username: string;
  score: number;
  total: number;
  percentage: number;
  categoryScores: Record<string, { correct: number; total: number }>;
  date: string;
}

export default function TrainingResults() {
  const [results, setResults] = useState<QuizResult[]>([]);

  useEffect(() => {
    async function fetchResults() {
      // Try Supabase first
      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .order('completed_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: QuizResult[] = data.map((r: any) => ({
          username: r.username,
          score: r.score,
          total: r.total,
          percentage: r.percentage,
          categoryScores: (r.category_scores as Record<string, { correct: number; total: number }>) || {},
          date: r.completed_at,
        }));
        setResults(mapped);
      } else {
        // Fallback to localStorage for backward compatibility
        const saved = localStorage.getItem('training-quiz-results');
        if (saved) {
          setResults(JSON.parse(saved));
        }
      }
    }
    fetchResults();
  }, []);

  // Group by user, get latest + best for each
  const userSummaries = Object.entries(
    results.reduce((acc, r) => {
      if (!acc[r.username]) acc[r.username] = [];
      acc[r.username].push(r);
      return acc;
    }, {} as Record<string, QuizResult[]>)
  ).map(([username, attempts]) => {
    const sorted = [...attempts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const best = attempts.reduce((a, b) => a.percentage > b.percentage ? a : b);
    const latest = sorted[0];
    return { username, attempts: attempts.length, best, latest };
  });

  const avgScore = results.length > 0 
    ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length) 
    : 0;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Training Results</h1>
        <p className="text-muted-foreground text-sm mt-1">Quiz scores across the team — admin & supervisor view only</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{userSummaries.length}</p>
              <p className="text-xs text-muted-foreground">Team members tested</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{avgScore}%</p>
              <p className="text-xs text-muted-foreground">Average score</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center justify-center">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{results.length}</p>
              <p className="text-xs text-muted-foreground">Total attempts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-user results */}
      {userSummaries.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="p-8 text-center text-muted-foreground">
            <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No quiz results yet. Chatters will appear here once they complete the training quiz.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {userSummaries.map(({ username, attempts, best, latest }) => (
            <Card key={username} className="glass-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-400" />
                    {username}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={best.percentage >= 80 ? "default" : best.percentage >= 60 ? "secondary" : "destructive"}>
                      Best: {best.percentage}%
                    </Badge>
                    <Badge variant="outline">{attempts} attempt{attempts !== 1 ? 's' : ''}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-secondary/30 text-center">
                    <p className="text-lg font-bold">{best.score}/{best.total}</p>
                    <p className="text-[10px] text-muted-foreground">Best Score</p>
                  </div>
                  <div className="p-2 rounded-lg bg-secondary/30 text-center">
                    <p className="text-lg font-bold">{latest.score}/{latest.total}</p>
                    <p className="text-[10px] text-muted-foreground">Latest Score</p>
                  </div>
                  <div className="p-2 rounded-lg bg-secondary/30 text-center">
                    <p className="text-lg font-bold">{latest.percentage}%</p>
                    <p className="text-[10px] text-muted-foreground">Latest %</p>
                  </div>
                  <div className="p-2 rounded-lg bg-secondary/30 text-center">
                    <p className="text-lg font-bold">{new Date(latest.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                    <p className="text-[10px] text-muted-foreground">Last Attempt</p>
                  </div>
                </div>

                {/* Category breakdown */}
                {Object.keys(latest.categoryScores).length > 0 && (
                  <>
                    <div className="text-xs text-muted-foreground mb-1 font-medium">Category Breakdown (latest):</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Object.entries(latest.categoryScores).map(([cat, { correct, total }]) => (
                        <div key={cat} className="p-2 rounded bg-secondary/20 text-center">
                          <p className="text-xs font-bold">{correct}/{total}</p>
                          <p className="text-[9px] text-muted-foreground truncate">{cat}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
