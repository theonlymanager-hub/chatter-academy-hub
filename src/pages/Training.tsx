import { trainingCurriculum } from "@/lib/mock-data";
import { Check, X, Lock, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Training() {
  const totalLessons = trainingCurriculum.reduce((s, w) => s + w.lessons.length, 0);
  const completedLessons = trainingCurriculum.reduce((s, w) => s + w.lessons.filter((l) => l.completed).length, 0);
  const overallProgress = Math.round((completedLessons / totalLessons) * 100);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Training Progress</h1>
        <p className="text-muted-foreground text-sm mt-1">6-week curriculum tracker</p>
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm text-muted-foreground">{completedLessons}/{totalLessons} lessons</span>
        </div>
        <Progress value={overallProgress} className="h-3" />
        <p className="text-xs text-muted-foreground mt-2">{overallProgress}% complete</p>
      </div>

      <div className="space-y-4">
        {trainingCurriculum.map((week) => {
          const weekCompleted = week.lessons.filter((l) => l.completed).length;
          const weekTotal = week.lessons.length;
          const isLocked = week.week > 3;

          return (
            <div key={week.week} className={`glass-card p-5 ${isLocked ? "opacity-50" : ""}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${weekCompleted === weekTotal ? "bg-success/20 text-success" : isLocked ? "bg-muted text-muted-foreground" : "bg-primary/20 text-primary"}`}>
                  {isLocked ? <Lock className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">Week {week.week}: {week.title}</h3>
                  <p className="text-xs text-muted-foreground">{weekCompleted}/{weekTotal} lessons completed</p>
                </div>
                <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${week.testPassed ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
                  {week.testPassed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  Test {week.testPassed ? "Passed" : "Pending"}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {week.lessons.map((lesson, i) => (
                  <div key={i} className={`flex items-center gap-2 text-sm p-2 rounded-lg ${lesson.completed ? "bg-success/5" : "bg-secondary/30"}`}>
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center ${lesson.completed ? "bg-success text-success-foreground" : "border border-border"}`}>
                      {lesson.completed && <Check className="h-3 w-3" />}
                    </div>
                    <span className={lesson.completed ? "" : "text-muted-foreground"}>{lesson.name}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
