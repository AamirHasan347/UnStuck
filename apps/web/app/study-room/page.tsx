"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"

const StudyRoomContent = () => {
  const searchParams = useSearchParams()
  const task = searchParams.get("task") || "Focus Session"
  const mode = searchParams.get("mode") || "standard"
  
  // Get the return URL (Defaults to youtube.com if not present)
  const returnUrl = searchParams.get("returnUrl") || "https://youtube.com"
  
  const getModeConfig = () => {
    switch (mode) {
      case "speedrun": return { time: 30 * 60, label: "SPEED RUN", color: "text-amber-500", bg: "bg-amber-500" };
      case "deepwork": return { time: 90 * 60, label: "DEEP WORK", color: "text-blue-500", bg: "bg-blue-500" };
      default: return { time: 50 * 60, label: "STANDARD", color: "text-emerald-500", bg: "bg-emerald-500" };
    }
  }

  const config = getModeConfig()
  const [timeLeft, setTimeLeft] = useState(config.time)
  const [isRunning, setIsRunning] = useState(true)

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  const handleEndSession = () => {
    window.postMessage({ action: "UNSTUCK_END_SESSION" }, "*");
    // Route back to exact URL they came from!
    window.location.href = returnUrl; 
  }

  const [showMusicInput, setShowMusicInput] = useState(false)
  const [customLink, setCustomLink] = useState("")
  // Defaulting to YouTube Lofi Girl for uninterrupted continuous play
  const [embedUrl, setEmbedUrl] = useState("https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=0&controls=0")
  const [isSpotify, setIsSpotify] = useState(false)

  const handleSetCustomMusic = (e: React.FormEvent) => {
    e.preventDefault();
    if (customLink.includes("spotify.com")) {
      const link = customLink.replace("open.spotify.com/", "open.spotify.com/embed/").split("?")[0] + "?utm_source=generator&theme=0";
      setEmbedUrl(link);
      setIsSpotify(true);
    } else if (customLink.includes("youtube.com") || customLink.includes("youtu.be")) {
      // Basic YT link converter
      const videoId = customLink.split('v=')[1]?.split('&')[0] || customLink.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) {
        setEmbedUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1`);
        setIsSpotify(false);
      }
    }
    setShowMusicInput(false);
    setCustomLink("");
  }

  const [showFlashcards, setShowFlashcards] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [flashcards, setFlashcards] = useState<{q: string, a: string}[]>([])

  const generateFlashcards = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: task }), 
      });
      const data = await res.json();
      if (data.flashcards) setFlashcards(data.flashcards);
    } catch (error) {
      console.error("Network Error:", error);
    }
    setIsGenerating(false)
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans overflow-hidden selection:bg-white selection:text-black">
      
      <nav className="absolute top-0 inset-x-0 p-8 flex justify-between items-center z-10">
        <div className="flex flex-col">
          <div className="text-xs font-bold tracking-[0.2em] text-zinc-500 uppercase">UnStuck</div>
          <div className={`text-[10px] font-bold tracking-[0.3em] uppercase mt-1 flex items-center gap-2 ${config.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${config.bg}`} /> 
            {config.label} ACTIVE
          </div>
        </div>
        <button onClick={handleEndSession} className="text-xs font-semibold tracking-widest text-zinc-400 hover:text-white uppercase transition-colors">
          End Session ✕
        </button>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center p-6 transition-all duration-500" style={{ transform: showFlashcards ? 'translateX(-15%)' : 'translateX(0)' }}>
        <h2 className="text-sm md:text-base font-medium tracking-widest text-zinc-400 uppercase mb-8 text-center max-w-md">{task}</h2>
        
        <div className={`text-8xl md:text-[12rem] font-light tracking-tighter tabular-nums ${timeLeft === 0 ? 'text-zinc-600' : 'text-white'}`}>
          {formatTime(timeLeft)}
        </div>

        <div className="mt-12 flex gap-6">
          <button onClick={() => setIsRunning(!isRunning)} className="w-16 h-16 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-zinc-900 hover:border-zinc-700 transition-all group">
            {isRunning ? (
              <span className="w-4 h-4 border-l-4 border-r-4 border-white group-hover:border-emerald-400 transition-colors" /> 
            ) : (
              <span className="w-0 h-0 border-t-8 border-t-transparent border-l-[12px] border-l-white border-b-8 border-b-transparent ml-1 group-hover:border-l-emerald-400 transition-colors" /> 
            )}
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 inset-x-8 flex justify-between items-end z-10 pointer-events-none">
        
        <div className="pointer-events-auto flex flex-col gap-4 max-w-sm w-full">
          {showMusicInput ? (
            <form onSubmit={handleSetCustomMusic} className="flex gap-2 animate-fade-in">
              <input autoFocus type="text" placeholder="Paste YouTube or Spotify Link..." value={customLink} onChange={(e) => setCustomLink(e.target.value)} className="flex-1 bg-zinc-900/80 backdrop-blur border border-zinc-800 text-xs px-4 py-3 rounded-lg outline-none focus:border-emerald-500 transition-colors" />
              <button type="submit" className="px-4 bg-white text-black text-xs font-bold uppercase rounded-lg hover:bg-emerald-400 transition-colors">Play</button>
              <button type="button" onClick={() => setShowMusicInput(false)} className="px-4 border border-zinc-800 text-zinc-400 text-xs font-bold uppercase rounded-lg hover:text-white transition-colors">✕</button>
            </form>
          ) : (
            <div className="flex flex-col gap-1">
              <button onClick={() => setShowMusicInput(true)} className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase hover:text-white flex items-center gap-2 self-start transition-colors">
                + Custom Player
              </button>
              {isSpotify && <span className="text-[8px] text-zinc-600 uppercase tracking-widest">Note: Spotify previews are 30s unless logged in.</span>}
            </div>
          )}
          
          <div className={`w-full rounded-xl overflow-hidden border border-zinc-800 opacity-70 hover:opacity-100 transition-opacity ${isSpotify ? 'h-[80px]' : 'h-[180px]'}`}>
            <iframe src={embedUrl} width="100%" height="100%" frameBorder="0" allow="autoplay; encrypted-media"></iframe>
          </div>
        </div>

        <button onClick={() => setShowFlashcards(!showFlashcards)} className="pointer-events-auto px-6 py-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-xs font-bold tracking-widest uppercase text-white rounded-xl transition-all">
          {showFlashcards ? 'Close Deck' : 'AI Flashcards'}
        </button>
      </div>

      <div className={`absolute top-0 right-0 h-full w-[400px] bg-zinc-900/90 backdrop-blur-xl border-l border-zinc-800 p-8 flex flex-col transition-transform duration-500 z-20 ${showFlashcards ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xs font-bold tracking-[0.2em] text-emerald-500 uppercase">Active Recall</h3>
          <button onClick={() => setShowFlashcards(false)} className="text-zinc-500 hover:text-white">✕</button>
        </div>

        {flashcards.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <p className="text-zinc-500 text-sm mb-6 leading-relaxed">Extracting core concepts from your current task to test your memory.</p>
            <button onClick={generateFlashcards} disabled={isGenerating} className="w-full py-4 bg-white text-black text-xs font-bold tracking-widest uppercase rounded-lg hover:bg-emerald-400 disabled:opacity-50 transition-colors">
              {isGenerating ? 'Generating...' : 'Generate Deck'}
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-2">
            {flashcards.map((card, idx) => (
              <div key={idx} className="group p-5 border border-zinc-800 rounded-lg hover:border-emerald-500/50 transition-colors cursor-pointer relative perspective">
                <div className="text-sm text-zinc-300 font-medium mb-2">{card.q}</div>
                <div className="text-xs text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity mt-4 pt-4 border-t border-zinc-800/50">
                  {card.a}
                </div>
              </div>
            ))}
          </div>
        )}
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