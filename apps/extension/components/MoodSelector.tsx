// apps/extension/components/MoodSelector.tsx
import { useState } from "react"

interface MoodSelectorProps {
  onSelect: (mood: string) => void;
}

export const MoodSelector = ({ onSelect }: MoodSelectorProps) => {
  const moods = [
    { label: "Overwhelmed", emoji: "😵‍💫", color: "bg-red-500/20 hover:bg-red-500/40 text-red-400 border-red-500/50" },
    { label: "Stressed", emoji: "😰", color: "bg-orange-500/20 hover:bg-orange-500/40 text-orange-400 border-orange-500/50" },
    { label: "Normal", emoji: "😐", color: "bg-gray-500/20 hover:bg-gray-500/40 text-gray-300 border-gray-500/50" },
    { label: "Motivated", emoji: "🔥", color: "bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 border-blue-500/50" },
    { label: "Excited", emoji: "🚀", color: "bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 border-emerald-500/50" }
  ]

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold text-white mb-2">Before we begin...</h1>
      <p className="text-zinc-400 mb-8 text-lg">How are you feeling about this study session?</p>

      <div className="flex flex-wrap justify-center gap-4">
        {moods.map((mood) => (
          <button
            key={mood.label}
            onClick={() => onSelect(mood.label)}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 w-32 ${mood.color}`}
          >
            <span className="text-3xl mb-2">{mood.emoji}</span>
            <span className="font-medium text-sm">{mood.label}</span>
          </button>
        ))}
        
      </div>
      <div className="mt-8 text-xs text-zinc-500">
        UnStuck will adapt your session based on your choice.
      </div>
    </div>
  )
}

