// apps/extension/components/TwoMinuteRule.tsx
import { useState, useEffect } from "react"

interface TwoMinuteRuleProps {
  onComplete: () => void;
}

export const TwoMinuteRule = ({ onComplete }: TwoMinuteRuleProps) => {
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [answered, setAnswered] = useState(false);

  // Simple countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (isCorrect: boolean) => {
    setAnswered(true);
    // Add a slight delay before moving to the next phase so they see the success state
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  return (
    <div className="text-left w-full max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">2-Minute Warmup</h2>
          <p className="text-zinc-400 text-sm">Let's build some momentum from yesterday.</p>
        </div>
        <div className={`text-xl font-mono px-3 py-1 rounded-md bg-zinc-800 ${timeLeft < 30 ? 'text-red-400' : 'text-emerald-400'}`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="bg-zinc-800/50 border border-zinc-700 p-6 rounded-xl mb-6">
        <p className="text-zinc-300 text-sm mb-2 font-semibold text-blue-400">Physics • Simple Harmonic Motion</p>
        <p className="text-white text-lg mb-6">
          When two springs with constants k₁ and k₂ are connected end-to-end, they are in _____, and the equivalent spring constant is _____.
        </p>

        <div className="space-y-3">
          <button 
            onClick={() => handleAnswer(false)}
            disabled={answered}
            className="w-full text-left p-4 rounded-lg border border-zinc-700 hover:bg-zinc-700 transition-colors text-zinc-200"
          >
            A) Parallel; k₁ + k₂
          </button>
          <button 
            onClick={() => handleAnswer(true)}
            disabled={answered}
            className={`w-full text-left p-4 rounded-lg border transition-colors ${answered ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'border-zinc-700 hover:bg-zinc-700 text-zinc-200'}`}
          >
            B) Series; (k₁k₂) / (k₁ + k₂)
          </button>
        </div>
      </div>

      {answered && (
        <div className="text-center text-emerald-400 animate-fade-in">
          Spot on! You've got this. Let's set up your focus session.
        </div>
      )}
    </div>
  )
}