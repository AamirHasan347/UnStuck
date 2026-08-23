import { useState, useEffect } from "react"
import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://*.youtube.com/*", "https://*.pw.live/*"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

type Step = 'intent' | 'mood' | 'task'

// The Smart Routing Dictionary
const MOODS = [
  { id: "motivated", label: "Motivated", desc: "Clear mind, ready to execute.", type: "execute" },
  { id: "normal", label: "Normal", desc: "Standard baseline focus.", type: "execute" },
  { id: "excited", label: "Excited", desc: "Highly stimulated, high dopamine.", type: "execute" },
  { id: "overwhelmed", label: "Overwhelmed", desc: "Lost direction, too much to do.", type: "intervention" },
  { id: "stressed", label: "Stressed", desc: "High pressure, physical tension.", type: "intervention" },
  { id: "anxious", label: "Anxious", desc: "Overthinking, fear of falling behind.", type: "intervention" }
]

export default function UnStuckOverlay() {
  const [isVisible, setIsVisible] = useState(true)
  const [step, setStep] = useState<Step>('intent')
  const [mood, setMood] = useState("")
  const [task, setTask] = useState("")

  useEffect(() => {
    const hostname = window.location.hostname;
    const studySites = ["pw.live", "unacademy.com", "vedantu.com"];
    
    if (studySites.some(site => hostname.includes(site))) {
      setStep('mood');
    }
  }, [])

  if (!isVisible) return null;

  const handleMoodSelection = (selectedMood: typeof MOODS[0]) => {
    setMood(selectedMood.id);
    
    if (selectedMood.type === "execute") {
      setStep('task');
    } else {
      // INTERVENTION ROUTE: Instantly get them out of YouTube
      window.location.href = `https://un-stuck-web-gamma.vercel.app/coach?mood=${selectedMood.id}`;
    }
  }

  // BULLETPROOF REDIRECT: Replaced form submission with direct click/key handlers
  const handleGoToStudyRoom = async () => {
    if (!task) return;

    await chrome.storage.local.set({ 
      isSessionActive: true, 
      currentTask: task 
    });
    
    window.location.href = `https://un-stuck-web-gamma.vercel.app/study-room?task=${encodeURIComponent(task)}`;
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleGoToStudyRoom();
    }
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-xl font-sans text-white selection:bg-white selection:text-black">
      
      <div className="absolute top-8 text-xs font-bold tracking-[0.2em] text-zinc-600 uppercase">
        UnStuck
      </div>

      <div className="flex flex-col items-center justify-center text-center w-full max-w-3xl px-6 animate-fade-in">
        
        {/* STEP 1: INTENT GATE */}
        {step === 'intent' && (
          <div className="space-y-12 w-full animate-fade-in">
            <div>
              <h2 className="text-[10px] font-bold tracking-[0.3em] text-zinc-500 uppercase mb-4">Current Domain: {window.location.hostname}</h2>
              <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white">Are you here to study?</h1>
            </div>
            <div className="flex gap-4 justify-center w-full max-w-md mx-auto">
              <button 
                onClick={() => setIsVisible(false)}
                className="flex-1 py-4 text-xs font-bold tracking-widest uppercase text-zinc-500 hover:text-white border border-zinc-800 hover:border-zinc-600 transition-all"
              >
                Just Browsing
              </button>
              <button 
                onClick={() => setStep('mood')}
                className="flex-1 py-4 text-xs font-bold tracking-widest uppercase text-white border border-white hover:bg-white hover:text-black transition-all"
              >
                Yes, Let's Work
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: EXPANDED MOOD SELECTOR */}
        {step === 'mood' && (
          <div className="space-y-12 w-full animate-fade-in">
            <div>
              <h2 className="text-[10px] font-bold tracking-[0.3em] text-zinc-500 uppercase mb-4">Phase 1 / Calibration</h2>
              <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white">Assess your current state.</h1>
            </div>
            {/* 2-Column Grid for the 6 Emotions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mx-auto">
              {MOODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleMoodSelection(m)}
                  className="group flex flex-col items-start p-6 border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-900/10 transition-all text-left w-full"
                >
                  <span className="text-sm font-semibold tracking-wide text-zinc-200 group-hover:text-white transition-colors">{m.label}</span>
                  <span className="text-xs text-zinc-500 mt-2 leading-relaxed">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: TASK DEFINITION (Div instead of Form) */}
        {step === 'task' && (
          <div className="space-y-12 w-full animate-fade-in">
             <div>
              <h2 className="text-[10px] font-bold tracking-[0.3em] text-emerald-500 uppercase mb-4">Phase 2 / Target</h2>
              <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white">What is the specific target?</h1>
            </div>
            <div className="flex flex-col items-center w-full max-w-md mx-auto">
              <input
                autoFocus
                type="text"
                placeholder="e.g. Kinematics PYQs..."
                value={task}
                onChange={(e) => setTask(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent border-b border-zinc-800 focus:border-emerald-500 text-2xl font-light py-4 text-center text-white placeholder:text-zinc-700 outline-none transition-colors"
              />
              <button 
                onClick={handleGoToStudyRoom}
                disabled={!task}
                className="mt-12 w-full py-4 text-xs font-bold tracking-widest uppercase text-black bg-white hover:bg-emerald-400 disabled:opacity-30 disabled:hover:bg-white transition-colors"
              >
                Enter Zen Room →
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}