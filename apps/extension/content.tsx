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

type Step = 'intent' | 'mood' | 'task' | 'hud'

const MOODS = [
  { id: "motivated", label: "Motivated", desc: "Clear mind, ready to execute.", type: "execute", modifier: "deepwork" },
  { id: "normal", label: "Normal", desc: "Standard baseline focus.", type: "execute", modifier: "standard" },
  { id: "excited", label: "Excited", desc: "Highly stimulated, high dopamine.", type: "execute", modifier: "speedrun" },
  { id: "overwhelmed", label: "Overwhelmed", desc: "Lost direction, too much to do.", type: "intervention", modifier: "warmup" },
  { id: "stressed", label: "Stressed", desc: "High pressure, physical tension.", type: "intervention", modifier: "warmup" },
  { id: "anxious", label: "Anxious", desc: "Overthinking, fear of falling behind.", type: "intervention", modifier: "warmup" }
]

export default function UnStuckOverlay() {
  const [isVisible, setIsVisible] = useState(true)
  const [step, setStep] = useState<Step>('intent')
  const [activeMood, setActiveMood] = useState<typeof MOODS[0] | null>(null)
  const [task, setTask] = useState("")
  
  // HUD State
  const [timeLeft, setTimeLeft] = useState(50 * 60)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [showPlayer, setShowPlayer] = useState(false)

  // SCROLL LOCK EFFECT
  useEffect(() => {
    if (isVisible && step !== 'hud') {
      document.body.style.overflow = 'hidden' // Lock background scrolling
    } else {
      document.body.style.overflow = 'auto' // Restore when HUD is active or closed
    }
    return () => { document.body.style.overflow = 'auto' } // Cleanup
  }, [isVisible, step])

  useEffect(() => {
    const hostname = window.location.hostname;
    const studySites = ["pw.live", "unacademy.com", "vedantu.com"];
    
    if (studySites.some(site => hostname.includes(site))) {
      setStep('mood');
    }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft])

  if (!isVisible) return null;

  const handleMoodSelection = (selectedMood: typeof MOODS[0]) => {
    setActiveMood(selectedMood);
    
    if (selectedMood.modifier === "warmup") setTimeLeft(2 * 60);
    else if (selectedMood.modifier === "speedrun") setTimeLeft(30 * 60);
    else if (selectedMood.modifier === "deepwork") setTimeLeft(90 * 60);
    else setTimeLeft(50 * 60);
    
    setStep('task');
  }

  const handleInitialize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    setStep('hud');
    setIsTimerRunning(true);
  }

  const handleGoToStudyRoom = async () => {
    if (!task || !activeMood) return;

    await chrome.storage.local.set({ isSessionActive: true, currentTask: task });
    
    // Capture the current URL to pass to the web app!
    const returnUrl = encodeURIComponent(window.location.href);
    window.location.assign(`https://un-stuck-web-gamma.vercel.app/study-room?task=${encodeURIComponent(task)}&mode=${activeMood.modifier}&returnUrl=${returnUrl}`);
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  const handleBack = () => {
    if (step === 'task') setStep('mood')
    else if (step === 'mood' && !["pw.live", "unacademy.com"].some(site => window.location.hostname.includes(site))) setStep('intent')
  }

  return (
    // FORCED CSS RESET: inline style font-size: 16px fixes PW's massive zooming bug
    <div style={{ fontSize: '16px' }} className="plasmo-reset-container">
      {step !== 'hud' && (
        // TRANSLUCENT BG: bg-black/75 instead of bg-black/95
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 backdrop-blur-xl font-sans text-white pointer-events-auto">
          
          {/* TOP BAR */}
          <div className="absolute top-8 inset-x-8 flex justify-between items-center w-full px-8 max-w-5xl mx-auto">
            {step !== 'intent' ? (
              <button onClick={handleBack} className="text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2">
                ← Back
              </button>
            ) : <div></div>}
            
            <div className="text-xs font-bold tracking-[0.3em] text-zinc-500 uppercase">
              UnStuck / Auto-Calibrating
            </div>
            
            <button onClick={() => setIsVisible(false)} className="text-xs font-bold text-zinc-600 hover:text-white uppercase tracking-widest transition-colors">
              Close ✕
            </button>
          </div>

          <div className="flex flex-col items-center justify-center text-center w-full max-w-5xl px-8 animate-fade-in">
            {step === 'intent' && (
              <div className="space-y-12 w-full animate-fade-in">
                <div>
                  <h2 className="text-[11px] font-bold tracking-[0.4em] text-zinc-400 uppercase mb-4">Domain: {window.location.hostname}</h2>
                  <h1 className="text-5xl md:text-6xl font-light tracking-tighter text-white leading-none">Are you here to study?</h1>
                </div>
                <div className="flex gap-4 justify-center w-full max-w-xl mx-auto">
                  <button onClick={() => setIsVisible(false)} className="flex-1 py-5 text-xs font-bold tracking-widest uppercase text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 bg-transparent transition-all rounded-xl">
                    Just Browsing
                  </button>
                  <button onClick={() => setStep('mood')} className="flex-1 py-5 text-xs font-bold tracking-widest uppercase text-black bg-white hover:bg-emerald-400 border-none transition-all rounded-xl">
                    Yes, Let's Work
                  </button>
                </div>
              </div>
            )}

            {step === 'mood' && (
              <div className="space-y-12 w-full animate-fade-in">
                <div>
                  <h2 className="text-[11px] font-bold tracking-[0.4em] text-zinc-400 uppercase mb-4">Phase 1 / Cognitive Baseline</h2>
                  <h1 className="text-5xl md:text-6xl font-light tracking-tighter text-white leading-none">Assess your state.</h1>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mx-auto">
                  {MOODS.map((m) => (
                    // FIX: border-zinc-800 to explicitly override PW's global button borders
                    <button key={m.id} onClick={() => handleMoodSelection(m)} className="group flex flex-col items-start p-6 border border-zinc-700 hover:border-emerald-500/50 bg-black/40 hover:bg-emerald-900/20 transition-all text-left w-full rounded-2xl outline-none">
                      <span className="text-base font-semibold tracking-wide text-zinc-200 group-hover:text-white transition-colors">{m.label}</span>
                      <span className="text-xs text-zinc-400 mt-2 leading-relaxed">{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 'task' && (
              <div className="space-y-12 w-full animate-fade-in">
                 <div>
                  <h2 className="text-[11px] font-bold tracking-[0.4em] text-emerald-500 uppercase mb-4">
                    Phase 2 / {activeMood?.modifier === 'warmup' ? '2-Minute Intervention' : 'Execution Mode'}
                  </h2>
                  <h1 className="text-5xl md:text-6xl font-light tracking-tighter text-white leading-none">Define the target.</h1>
                </div>
                <form onSubmit={handleInitialize} className="flex flex-col items-center w-full max-w-2xl mx-auto">
                  <input autoFocus type="text" placeholder="e.g. Current Electricity PYQs..." value={task} onChange={(e) => setTask(e.target.value)} className="w-full bg-transparent border-b-2 border-zinc-700 focus:border-emerald-500 text-3xl font-light py-4 text-center text-white placeholder:text-zinc-600 outline-none transition-colors" />
                  
                  <div className="flex gap-4 w-full mt-12">
                    <button type="button" onClick={handleGoToStudyRoom} disabled={!task} className="flex-1 py-5 text-xs font-bold tracking-widest uppercase text-white bg-zinc-800 hover:bg-zinc-700 border-none disabled:opacity-30 transition-colors rounded-xl">
                      Full Zen Room ↗
                    </button>
                    <button type="submit" disabled={!task} className="flex-1 py-5 text-xs font-bold tracking-widest uppercase text-black bg-white hover:bg-emerald-400 border-none disabled:opacity-30 transition-colors rounded-xl shadow-lg">
                      Start Here (HUD)
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AMBIENT HUD */}
      {step === 'hud' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[99999] pointer-events-auto flex items-center gap-4 bg-black/90 backdrop-blur-2xl border border-zinc-800 p-3 rounded-2xl shadow-2xl animate-fade-in">
          
          <div className="flex flex-col items-center justify-center px-4 border-r border-zinc-800">
            <span className={`text-[8px] font-bold uppercase tracking-[0.3em] ${activeMood?.modifier === 'warmup' ? 'text-amber-500' : 'text-emerald-500'}`}>
              {activeMood?.modifier || 'Standard'}
            </span>
            <span className="text-2xl font-light tabular-nums text-white mt-1">
              {formatTime(timeLeft)}
            </span>
          </div>

          <div className="flex items-center gap-2 px-2">
            <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="w-10 h-10 rounded-full bg-zinc-900 border-none flex items-center justify-center hover:bg-zinc-800 transition-colors">
              {isTimerRunning ? <span className="w-3 h-3 bg-white" /> : <span className="w-0 h-0 border-t-6 border-t-transparent border-l-[10px] border-l-white border-b-6 border-b-transparent ml-1" />}
            </button>
            <button onClick={() => setShowPlayer(!showPlayer)} className="w-10 h-10 rounded-full bg-zinc-900 border-none flex items-center justify-center hover:bg-zinc-800 transition-colors text-sm">
              🎧
            </button>
          </div>

          {/* Lofi Player Drop-up (Using YouTube Lofi Girl for uninterrupted playback!) */}
          {showPlayer && (
            <div className="absolute bottom-[110%] left-1/2 -translate-x-1/2 w-[300px] h-[170px] bg-black border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
              <iframe width="100%" height="100%" src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=0&controls=0" frameBorder="0" allow="autoplay; encrypted-media"></iframe>
            </div>
          )}

          <div className="flex gap-2 pl-3 border-l border-zinc-800">
             <button onClick={() => setIsVisible(false)} className="px-4 py-3 bg-transparent border-none text-zinc-500 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:text-white transition-colors">
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}