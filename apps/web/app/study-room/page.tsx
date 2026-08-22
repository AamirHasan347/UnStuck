"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { FlashcardViewer } from "@/components/FlashcardViewer"

const StudyRoomContent = () => {
  const searchParams = useSearchParams()
  const task = searchParams.get("task") || "Deep Work Session"

  const TOTAL_TIME = 50 * 60;
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME)
  const [isFlashcardOpen, setIsFlashcardOpen] = useState(false)
  const [todos, setTodos] = useState([
    { id: 1, text: "Watch Lecture", done: true },
    { id: 2, text: task, done: false },
    { id: 3, text: "Review AI Flashcards", done: false }
  ])

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

  const toggleTodo = (id: number) => {
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  const progressPercentage = ((TOTAL_TIME - timeLeft) / TOTAL_TIME) * 100;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans selection:bg-white selection:text-black flex items-center justify-center">
      
      <div 
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-900/30 to-transparent transition-all duration-1000 ease-linear pointer-events-none"
        style={{ height: `${progressPercentage}%` }}
      />

      <nav className="absolute top-0 inset-x-0 p-8 flex justify-between items-center z-10">
        <div className="text-xs font-bold tracking-[0.2em] text-zinc-500 uppercase">UnStuck</div>
        <button 
          onClick={() => {
            // Broadcast a message to the Chrome Extension
            window.postMessage({ action: "UNSTUCK_END_SESSION" }, "*");
            // Optional: Send them back to YouTube or a dashboard
            window.location.href = "https://youtube.com";
          }}
          className="text-xs font-semibold tracking-widest text-zinc-400 hover:text-white uppercase transition-colors"
        >
          End Session ✕
        </button>
      </nav>

      <div className={`relative z-10 flex flex-col items-center text-center transition-transform duration-500 ${isFlashcardOpen ? '-translate-x-48' : ''}`}>
        <h1 className="text-[12vw] font-black leading-none tracking-tighter text-white tabular-nums drop-shadow-2xl">
          {formatTime(timeLeft)}
        </h1>
        <p className="text-2xl md:text-4xl font-light text-zinc-400 mt-4 tracking-tight">
          {task}
        </p>
      </div>

      <div className={`absolute bottom-8 right-8 z-10 w-72 transition-opacity duration-500 ${isFlashcardOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="text-xs font-bold tracking-[0.2em] text-zinc-600 uppercase mb-4">Focus Queue</div>
        <div className="flex flex-col gap-1">
          {todos.map(todo => (
            <button 
              key={todo.id}
              onClick={() => toggleTodo(todo.id)}
              className="group flex items-center gap-4 py-2 w-full text-left transition-all"
            >
              <div className={`w-3 h-3 rounded-full border transition-all duration-300 ${todo.done ? 'bg-white border-white scale-75' : 'border-zinc-600 group-hover:border-zinc-400'}`} />
              <span className={`text-sm tracking-wide transition-all duration-300 ${todo.done ? 'text-zinc-600 line-through' : 'text-zinc-300 group-hover:text-white'}`}>
                {todo.text}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-8 z-20 flex items-center gap-6">
        <div className="flex items-center gap-4 group cursor-pointer">
          <button className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center group-hover:border-white transition-colors text-zinc-400 group-hover:text-white">
            <span className="text-sm">🎵</span>
          </button>
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-widest text-white uppercase">Lofi Girl</span>
            <span className="text-[10px] tracking-widest text-emerald-500 uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live
            </span>
          </div>
        </div>
        
        <div className="w-px h-8 bg-zinc-800"></div>

        <button 
          onClick={() => setIsFlashcardOpen(!isFlashcardOpen)}
          className={`flex items-center gap-3 transition-colors ${isFlashcardOpen ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
        >
          <span className="text-xl">🎴</span>
          <span className="text-xs font-bold tracking-widest uppercase">Recall Mode</span>
        </button>

        <iframe 
          className="hidden"
          src="https://www.youtube.com/embed/jfKfPfyJRmac?autoplay=1&mute=0" 
          allow="autoplay"
        ></iframe>
      </div>

      {/* Slide-out Flashcard Drawer */}
      <div 
        className={`absolute top-0 right-0 bottom-0 w-[500px] bg-black/80 backdrop-blur-2xl border-l border-zinc-800/50 z-30 transition-transform duration-500 ease-out ${isFlashcardOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <button 
          onClick={() => setIsFlashcardOpen(false)}
          className="absolute top-8 left-8 text-zinc-500 hover:text-white transition-colors"
        >
          ✕
        </button>
        <FlashcardViewer topic={task} />
      </div>

    </div>
  )
}

export default function StudyRoom() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white text-xs tracking-widest uppercase">Initializing...</div>}>
      <StudyRoomContent />
    </Suspense>
  )
}