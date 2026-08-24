"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"

const StudyRoomContent = () => {
  const searchParams = useSearchParams()
  const task = searchParams.get("task") || "Focus Session"
  const mode = searchParams.get("mode") || "standard"
  
  // Dynamic Configuration based on the Extension's flag
  const getModeConfig = () => {
    switch (mode) {
      case "speedrun":
        return { time: 30 * 60, label: "SPEED RUN", color: "text-amber-500", bg: "bg-amber-500" };
      case "deepwork":
        return { time: 90 * 60, label: "DEEP WORK", color: "text-blue-500", bg: "bg-blue-500" };
      default:
        return { time: 50 * 60, label: "STANDARD", color: "text-emerald-500", bg: "bg-emerald-500" };
    }
  }

  const config = getModeConfig()
  
  const [timeLeft, setTimeLeft] = useState(config.time)
  const [isRunning, setIsRunning] = useState(true) // Auto-start the timer

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      // Play a sound or trigger Anki flashcards here later
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  const handleEndSession = () => {
    // Tell the extension we are done so it stops blocking tabs
    window.postMessage({ action: "UNSTUCK_END_SESSION" }, "*");
    window.location.href = "https://youtube.com";
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white selection:text-black">
      
      {/* Top Navigation */}
      <nav className="absolute top-0 inset-x-0 p-8 flex justify-between items-center z-10">
        <div className="flex flex-col">
          <div className="text-xs font-bold tracking-[0.2em] text-zinc-500 uppercase">UnStuck</div>
          <div className={`text-[10px] font-bold tracking-[0.3em] uppercase mt-1 flex items-center gap-2 ${config.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${config.bg}`} /> 
            {config.label} ACTIVE
          </div>
        </div>
        <button 
          onClick={handleEndSession}
          className="text-xs font-semibold tracking-widest text-zinc-400 hover:text-white uppercase transition-colors"
        >
          End Session ✕
        </button>
      </nav>

      {/* Main Timer Display */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <h2 className="text-sm md:text-base font-medium tracking-widest text-zinc-400 uppercase mb-8 text-center max-w-md">
          {task}
        </h2>
        
        <div className={`text-8xl md:text-[12rem] font-light tracking-tighter tabular-nums ${timeLeft === 0 ? 'text-zinc-600' : 'text-white'}`}>
          {formatTime(timeLeft)}
        </div>

        <div className="mt-12 flex gap-6">
          <button 
            onClick={() => setIsRunning(!isRunning)}
            className="w-16 h-16 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-zinc-900 hover:border-zinc-700 transition-all"
          >
            {isRunning ? (
              <span className="w-4 h-4 bg-white" /> // Pause Square
            ) : (
              <span className="w-0 h-0 border-t-8 border-t-transparent border-l-[12px] border-l-white border-b-8 border-b-transparent ml-1" /> // Play Triangle
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function StudyRoom() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 tracking-widest text-xs uppercase animate-pulse">Initializing Environment...</div>}>
      <StudyRoomContent />
    </Suspense>
  )
}