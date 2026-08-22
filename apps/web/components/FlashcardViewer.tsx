"use client"

import { useState } from "react"

interface Flashcard {
  question: string;
  answer: string;
}

export const FlashcardViewer = ({ topic }: { topic: string }) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  const generateFlashcards = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic })
      })
      const data = await res.json()
      if (data.flashcards) {
        setFlashcards(data.flashcards)
        setCurrentIndex(0)
        setIsFlipped(false)
      }
    } catch (error) {
      console.error("Failed to fetch flashcards", error)
    }
    setLoading(false)
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <h3 className="text-sm font-bold tracking-[0.2em] text-zinc-500 uppercase mb-4">Active Recall</h3>
        <p className="text-xl font-light text-zinc-300 mb-8">{topic}</p>
        <button 
          onClick={generateFlashcards}
          disabled={loading}
          className="group relative px-6 py-3 font-semibold text-white tracking-widest uppercase text-xs transition-all"
        >
          <span className="absolute inset-0 border border-zinc-700 rounded-full group-hover:border-white transition-colors"></span>
          {loading ? "Generating..." : "Generate AI Deck"}
        </button>
      </div>
    )
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="flex flex-col h-full p-8">
      <div className="flex justify-between items-center text-xs font-bold tracking-[0.2em] text-zinc-600 uppercase mb-12">
        <span>Recall</span>
        <span>{currentIndex + 1} / {flashcards.length}</span>
      </div>

      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        className="flex-1 flex items-center justify-center text-center cursor-pointer group"
      >
        {isFlipped ? (
          <div className="animate-fade-in space-y-6">
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.3em]">Answer</span>
            <p className="text-2xl font-light text-zinc-200 leading-relaxed">{currentCard.answer}</p>
          </div>
        ) : (
          <div className="animate-fade-in space-y-6">
             <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] group-hover:text-white transition-colors">Question</span>
            <p className="text-3xl font-medium text-white leading-tight">{currentCard.question}</p>
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-12">
        <button 
          onClick={() => {
            setCurrentIndex((prev) => Math.max(0, prev - 1))
            setIsFlipped(false)
          }}
          disabled={currentIndex === 0}
          className="flex-1 py-4 text-xs font-bold tracking-widest uppercase text-zinc-500 hover:text-white disabled:opacity-30 transition-colors"
        >
          Back
        </button>
        <button 
          onClick={() => {
            if (currentIndex < flashcards.length - 1) {
              setCurrentIndex((prev) => prev + 1)
              setIsFlipped(false)
            }
          }}
          disabled={currentIndex === flashcards.length - 1}
          className="flex-1 py-4 text-xs font-bold tracking-widest uppercase text-white hover:text-emerald-400 disabled:opacity-30 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  )
}