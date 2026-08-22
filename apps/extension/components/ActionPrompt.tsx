// apps/extension/components/ActionPrompt.tsx
import { useState } from "react"

interface ActionPromptProps {
  onStartExtension: (task: string) => void;
  onGoToStudyRoom: (task: string) => void;
}

export const ActionPrompt = ({ onStartExtension, onGoToStudyRoom }: ActionPromptProps) => {
  const [task, setTask] = useState("");

  const handleStart = (destination: 'extension' | 'room') => {
    if (!task.trim()) {
      alert("Please enter a quick goal for this session!");
      return;
    }
    if (destination === 'extension') onStartExtension(task);
    else onGoToStudyRoom(task);
  };

  return (
    <div className="text-center w-full max-w-md mx-auto animate-fade-in">
      <h2 className="text-3xl font-bold text-white mb-2">You're ready.</h2>
      <p className="text-zinc-400 mb-8">What is your primary focus for this session?</p>

      {/* Simple, uncomplicated task input */}
      <div className="mb-8">
        <input 
          type="text" 
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="e.g., Watch Rotational Motion Lec 4 & Solve DPP"
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Option A: Extension Mode */}
        <button 
          onClick={() => handleStart('extension')}
          className="flex flex-col items-center justify-center p-4 rounded-xl border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
        >
          <span className="text-2xl mb-2">⏱️</span>
          <span className="font-semibold text-white text-sm">Stay Here</span>
          <span className="text-xs text-zinc-400 mt-1">Start background timer</span>
        </button>

        {/* Option B: Study Room Mode */}
        <button 
          onClick={() => handleStart('room')}
          className="flex flex-col items-center justify-center p-4 rounded-xl border border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
        >
          <span className="text-2xl mb-2">🎧</span>
          <span className="font-semibold text-white text-sm">Study Room</span>
          <span className="text-xs text-blue-200 mt-1">Lofi, Tree & No Distractions</span>
        </button>
      </div>
    </div>
  )
}