import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, RotateCcw, Play, Trophy, GraduationCap } from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  altCorrectAnswer?: number;
  explanation?: string;
  category: string;
}

const quizQuestions: Question[] = [
  {
    id: 1,
    question: "What defines a 'whale' fan?",
    options: [
      "Someone who spends $100+/month",
      "Someone who spends $500+/month and has emotional investment",
      "Someone who tips occasionally",
      "Someone who buys every PPV"
    ],
    correctAnswer: 1,
    explanation: "A whale spends $500+/month, has strong emotional investment, returns consistently, and buys without much convincing.",
    category: "Whale Creation"
  },
  {
    id: 2,
    question: "What is the FIRST stage of the whale creation process?",
    options: [
      "Paint a Future",
      "Test the Waters",
      "Information Gathering",
      "Mirror & Connect"
    ],
    correctAnswer: 2,
    altCorrectAnswer: 3,
    explanation: "Information Gathering is ideal — but Mirror & Connect is also valid. Not every fan opens up straight away. Some fans are closed off and need to trust you before sharing info. A good chatter reads the fan: if they're open, gather info first. If they're guarded, mirror their energy and connect before asking questions. Every fan is different.",
    category: "Whale Creation"
  },
  {
    id: 3,
    question: "If a fan responds 'You're cheeky' to a flirt, what should you do?",
    options: [
      "Push harder for content sales",
      "Slow play - keep building, don't push yet",
      "Change topic completely",
      "Ask for payment immediately"
    ],
    correctAnswer: 1,
    explanation: "'You're cheeky' means interested but cautious. Slow play and keep building rapport.",
    category: "Conversation Techniques"
  },
  {
    id: 4,
    question: "What's the minimum rapport building before ANY pitch?",
    options: [
      "2-3 messages",
      "5-7 messages",
      "10+ messages",
      "1 message is enough"
    ],
    correctAnswer: 1,
    explanation: "Always build rapport with 5-7 messages minimum before any sales pitch.",
    category: "Sales & Upselling"
  },
  {
    id: 5,
    question: "How often should PPVs be sent?",
    options: [
      "Daily",
      "Once a week",
      "2-3 times per week",
      "Only on weekends"
    ],
    correctAnswer: 2,
    explanation: "PPVs should be sent 2-3 times per week (recommended: Tuesday/Thursday/Saturday).",
    category: "PPV Strategy"
  },
  {
    id: 6,
    question: "What content locations are allowed for PPV mass messages?",
    options: [
      "Outdoor locations only",
      "Indoor locations only (bedroom, kitchen, bathroom, hallway, closet)",
      "Any location is fine",
      "Public places preferred"
    ],
    correctAnswer: 1,
    explanation: "All content must be indoor locations only for mass message PPVs.",
    category: "PPV Strategy"
  },
  {
    id: 7,
    question: "Why do whales typically leave?",
    options: [
      "They run out of money",
      "They feel taken for granted and like just a wallet",
      "Content quality decreases",
      "They find other platforms"
    ],
    correctAnswer: 1,
    explanation: "Whales leave when they feel taken for granted, sense they're just a wallet, or the 'spell' breaks.",
    category: "Fan Retention"
  },
  {
    id: 8,
    question: "What makes fans feel special and chosen?",
    options: [
      "Sending them exclusive discounts",
      "Remembering personal details and making them feel like the only one",
      "Giving them free content",
      "Responding faster than to other fans"
    ],
    correctAnswer: 1,
    explanation: "Remember everything about them, reference past conversations, create inside jokes, and make them feel chosen.",
    category: "Fan Psychology"
  },
  {
    id: 9,
    question: "What's the correct response time standard?",
    options: [
      "Under 1 minute",
      "Under 5 minutes average",
      "Under 15 minutes",
      "Within an hour"
    ],
    correctAnswer: 1,
    explanation: "Target response time is under 5 minutes average. 15+ minute average = 1 strike.",
    category: "Quality Standards"
  },
  {
    id: 10,
    question: "When handling objection 'Too expensive', what should you do?",
    options: [
      "Immediately drop the price by 50%",
      "Reframe value and offer tiered alternatives",
      "Insist on the original price",
      "End the conversation"
    ],
    correctAnswer: 1,
    explanation: "Reframe value (not price), offer tiered alternatives, and value stack - explain what makes it special.",
    category: "Sales & Upselling"
  },
  {
    id: 11,
    question: "Which persona trait matches Ashley's character?",
    options: [
      "Goth/mysterious",
      "Military/commanding",
      "College/shy",
      "Redhead/teasing"
    ],
    correctAnswer: 2,
    explanation: "Ashley's persona is College/Shy - tone DOWN forward messages, she's shy not aggressive.",
    category: "Model Personas"
  },
  {
    id: 12,
    question: "What's a critical error that results in immediate strikes?",
    options: [
      "Taking too long to respond",
      "Using the wrong name or mentioning other fans",
      "Not making enough sales",
      "Being too friendly"
    ],
    correctAnswer: 1,
    explanation: "Using wrong names, mentioning other fans, or breaking character are critical errors requiring immediate action.",
    category: "Common Mistakes"
  },
  {
    id: 13,
    question: "When should you 'paint a future' with a fan?",
    options: [
      "Immediately in the first message",
      "After information gathering and mirroring",
      "Only with whale-tier fans",
      "Never - it's not allowed"
    ],
    correctAnswer: 1,
    explanation: "Paint a future (Stage 3) comes after information gathering and mirroring - give them a view of potential.",
    category: "Whale Creation"
  },
  {
    id: 14,
    question: "What's the proper escalation for sexting guidelines?",
    options: [
      "Start explicit immediately",
      "Test waters with light flirt, then navigate based on response",
      "Wait for them to initiate",
      "Always be completely innocent"
    ],
    correctAnswer: 1,
    explanation: "Test waters with light flirt first, gauge reaction, then navigate based on their response type.",
    category: "Conversation Techniques"
  },
  {
    id: 15,
    question: "What should you do after a successful purchase?",
    options: [
      "Wait a few days before contact",
      "Always upsell - 'Want to see more?'",
      "Thank them and end conversation",
      "Ask for a review"
    ],
    correctAnswer: 1,
    explanation: "Always upsell after a purchase - 'Want to see more?' Revenue maximization rule.",
    category: "Sales & Upselling"
  }
];

// Get current user from session storage
function getCurrentUser(): string {
  try {
    const auth = sessionStorage.getItem('onlyboard_auth');
    if (auth) {
      const parsed = JSON.parse(auth);
      return parsed.displayName || parsed.username || 'Unknown';
    }
  } catch {}
  return 'Unknown';
}

// Save quiz result for management view
function saveQuizResult(username: string, score: number, total: number, categoryScores: Record<string, { correct: number; total: number }>) {
  const results = JSON.parse(localStorage.getItem('training-quiz-results') || '[]');
  results.push({
    username,
    score,
    total,
    percentage: Math.round((score / total) * 100),
    categoryScores,
    date: new Date().toISOString(),
  });
  localStorage.setItem('training-quiz-results', JSON.stringify(results));
}

export default function Training() {
  const [gameState, setGameState] = useState<'welcome' | 'playing' | 'finished'>('welcome');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState<number>(0);

  // Load best score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('training-quiz-best-score');
    if (saved) {
      setBestScore(parseInt(saved));
    }
  }, []);

  const startTraining = () => {
    setGameState('playing');
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setUserAnswers([]);
    setScore(0);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showFeedback) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    setShowFeedback(true);
    const newAnswers = [...userAnswers, selectedAnswer];
    setUserAnswers(newAnswers);
    
    const q = quizQuestions[currentQuestionIndex];
    if (selectedAnswer === q.correctAnswer || (q.altCorrectAnswer !== undefined && selectedAnswer === q.altCorrectAnswer)) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 >= quizQuestions.length) {
      // Quiz finished
      setGameState('finished');
      const q = quizQuestions[currentQuestionIndex];
      const isLastCorrect = selectedAnswer === q.correctAnswer || (q.altCorrectAnswer !== undefined && selectedAnswer === q.altCorrectAnswer);
      const finalScore = score + (isLastCorrect ? 1 : 0);
      
      // Save best score
      if (finalScore > bestScore) {
        setBestScore(finalScore);
        localStorage.setItem('training-quiz-best-score', finalScore.toString());
      }

      // Save detailed results for management
      const categoryScores: Record<string, { correct: number; total: number }> = {};
      const allAnswers = [...userAnswers, selectedAnswer!];
      quizQuestions.forEach((q, i) => {
        if (!categoryScores[q.category]) categoryScores[q.category] = { correct: 0, total: 0 };
        categoryScores[q.category].total++;
        const ans = allAnswers[i];
        if (ans === q.correctAnswer || (q.altCorrectAnswer !== undefined && ans === q.altCorrectAnswer)) {
          categoryScores[q.category].correct++;
        }
      });
      saveQuizResult(getCurrentUser(), finalScore, quizQuestions.length, categoryScores);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
  const finalScore = gameState === 'finished' ? score + (userAnswers[userAnswers.length - 1] === quizQuestions[quizQuestions.length - 1].correctAnswer ? 0 : 0) : score;

  if (gameState === 'welcome') {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Training!</h1>
          <p className="text-muted-foreground text-lg">Test your knowledge of the coaching playbook</p>
        </div>

        <Card className="text-center p-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-3">
              <GraduationCap className="h-8 w-8 text-primary" />
              Interactive Quiz System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-primary">{quizQuestions.length}</div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-primary">7</div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-primary">{bestScore}</div>
                <div className="text-sm text-muted-foreground">Best Score</div>
              </div>
            </div>

            <div className="text-sm text-muted-foreground max-w-md mx-auto">
              Questions cover whale creation, conversation techniques, sales strategy, PPV guidelines, fan psychology, and quality standards.
            </div>

            <p className="text-lg font-medium">Are you ready to begin?</p>
            
            <Button 
              size="lg" 
              onClick={startTraining}
              className="px-8"
            >
              <Play className="mr-2 h-5 w-5" />
              Start Training
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameState === 'finished') {
    const percentage = Math.round((finalScore / quizQuestions.length) * 100);
    const isNewBest = finalScore === bestScore;
    
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Training Complete!</h1>
        </div>

        <Card className="text-center p-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-500" />
              Your Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="text-4xl font-bold text-primary">
                {finalScore}/{quizQuestions.length}
              </div>
              <div className="text-xl text-muted-foreground">
                {percentage}% Complete
              </div>
              
              {isNewBest && (
                <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                  🎉 New Best Score!
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2 p-4 rounded-lg bg-green-500/10">
                <div className="text-green-600 font-medium">Correct Answers</div>
                <div className="text-2xl font-bold text-green-600">{finalScore}</div>
              </div>
              <div className="space-y-2 p-4 rounded-lg bg-red-500/10">
                <div className="text-red-600 font-medium">Incorrect Answers</div>
                <div className="text-2xl font-bold text-red-600">{quizQuestions.length - finalScore}</div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Performance Breakdown:</h3>
              <div className="text-left space-y-2 max-w-md mx-auto">
                {percentage >= 90 && (
                  <div className="text-green-600">⭐ Elite Performance - Exceptional understanding!</div>
                )}
                {percentage >= 75 && percentage < 90 && (
                  <div className="text-blue-600">✅ Good Performance - Meeting expectations!</div>
                )}
                {percentage >= 60 && percentage < 75 && (
                  <div className="text-yellow-600">⚠️ Needs Improvement - Review the knowledge base</div>
                )}
                {percentage < 60 && (
                  <div className="text-red-600">🔴 Below Standard - Requires additional training</div>
                )}
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={startTraining}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Retake Quiz
              </Button>
              <Button variant="outline" onClick={() => setGameState('welcome')}>
                Back to Welcome
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Question {currentQuestionIndex + 1} of {quizQuestions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline">{currentQuestion.category}</Badge>
            <div className="text-sm text-muted-foreground">
              Score: {score}/{currentQuestionIndex + (showFeedback ? 1 : 0)}
            </div>
          </div>
          <CardTitle className="text-xl leading-relaxed">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correctAnswer || (currentQuestion.altCorrectAnswer !== undefined && index === currentQuestion.altCorrectAnswer);
              const isIncorrect = showFeedback && isSelected && !isCorrect;
              const showAsCorrect = showFeedback && isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showFeedback}
                  className={`w-full p-4 rounded-lg text-left transition-all border-2 ${
                    showAsCorrect
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : isIncorrect
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50 hover:bg-accent/50'
                  } ${showFeedback ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      showAsCorrect
                        ? 'border-green-500 bg-green-500'
                        : isIncorrect
                        ? 'border-red-500 bg-red-500'
                        : isSelected
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    }`}>
                      {showAsCorrect && <CheckCircle className="h-4 w-4 text-white" />}
                      {isIncorrect && <XCircle className="h-4 w-4 text-white" />}
                      {!showFeedback && isSelected && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="flex-1">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {showFeedback && currentQuestion.explanation && (
            <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
                  <span className="text-white text-sm font-bold">i</span>
                </div>
                <div>
                  <div className="font-medium text-blue-900 mb-1">Explanation</div>
                  <div className="text-blue-800 text-sm">{currentQuestion.explanation}</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              Best Score: {bestScore}/{quizQuestions.length}
            </div>
            
            {!showFeedback ? (
              <Button 
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
              >
                Submit Answer
              </Button>
            ) : (
              <Button onClick={handleNextQuestion}>
                {currentQuestionIndex + 1 >= quizQuestions.length ? 'View Results' : 'Next Question'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}