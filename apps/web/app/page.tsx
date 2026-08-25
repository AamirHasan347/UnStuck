"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface KnowledgeNode {
  id: string;
  topic: string;
  friction_score: number;
  last_encountered: string;
}

export default function Dashboard() {
  const router = useRouter()
  const [frictionTargets, setFrictionTargets] = useState<KnowledgeNode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [customTask, setCustomTask] = useState("")

  useEffect(() => {
    fetchKnowledgeGraph()
  }, [])

  const fetchKnowledgeGraph = async () => {
    try {
      // Pull the top 3 topics with the highest friction scores
      const { data, error } = await supabase
        .from('knowledge_graph')
        .select('*')
        .order('friction_score', { ascending: false })
        .limit(3)

      if (data) setFrictionTargets(data)
    } catch (error) {
      console.error("Error fetching graph:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLaunchWarmup = (topic: string) => {
    // Launches a low-friction standard session dedicated to the weakness
    router.push(`/study-room?task=${encodeURIComponent(topic + " Active Recall")}&mode=standard`)
  }

  const handleLaunchDeepWork = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customTask) return
    router.push(`/study-room?task=${encodeURIComponent(customTask)}&mode=deepwork`)
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-emerald-500 selection:text-black p-8 md:p-16">
      
      {/* Header */}
      <nav className="flex justify-between items-center border-b border-zinc-900 pb-8 mb-12">
        <div className="text-xs font-bold tracking-[0.2em] text-zinc-500 uppercase">
          UnStuck / Algorithmic OS
        </div>
        <div className="text-[10px] tracking-widest text-emerald-500 uppercase flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> System Online
        </div>
      </nav>

      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col gap-16 animate-fade-in">
        
        {/* Welcome Section */}
        <div>
          <h2 className="text-[10px] font-bold tracking-[0.3em] text-emerald-500 uppercase mb-4">Phase 1 / Analysis Complete</h2>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white mb-4">
            Your cognitive baseline is calibrated.
          </h1>
          <p className="text-zinc-500 font-light text-lg">Here is today's optimized route to close the syllabus gap for JEE 2027.</p>
        </div>

        {/* Phase 2: Algorithmic Warm-up */}
        <div>
          <h2 className="text-[10px] font-bold tracking-[0.3em] text-zinc-500 uppercase mb-6 border-b border-zinc-900 pb-4">
            Phase 2 / High-Friction Targets
          </h2>
          
          {isLoading ? (
            <div className="text-zinc-600 text-sm animate-pulse tracking-widest uppercase">Scanning Knowledge Graph...</div>
          ) : frictionTargets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {frictionTargets.map((node) => (
                <div key={node.id} className="p-6 border border-zinc-800 bg-zinc-900/30 rounded-xl hover:border-emerald-500/50 transition-colors flex flex-col justify-between group">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-medium text-white">{node.topic}</h3>
                      <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded">
                        +{node.friction_score} FRCTN
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed mb-6">
                      Identified as a cognitive bottleneck. Recommended 15-min active recall.
                    </p>
                  </div>
                  <button 
                    onClick={() => handleLaunchWarmup(node.topic)}
                    className="w-full py-3 border border-zinc-800 text-xs font-bold tracking-widest uppercase text-zinc-300 group-hover:bg-white group-hover:text-black group-hover:border-white transition-all rounded-lg"
                  >
                    Launch Warm-up
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 border border-zinc-800 rounded-xl text-center">
              <p className="text-zinc-500 text-sm">No friction data recorded yet. Keep studying and the algorithm will learn.</p>
            </div>
          )}
        </div>

        {/* Phase 3: Deep Work Execution */}
        <div>
          <h2 className="text-[10px] font-bold tracking-[0.3em] text-zinc-500 uppercase mb-6 border-b border-zinc-900 pb-4">
            Phase 3 / New Execution
          </h2>
          <form onSubmit={handleLaunchDeepWork} className="flex flex-col md:flex-row gap-4 max-w-2xl">
            <input
              type="text"
              placeholder="What is your next heavy target?"
              value={customTask}
              onChange={(e) => setCustomTask(e.target.value)}
              className="flex-1 bg-transparent border border-zinc-800 focus:border-blue-500 text-white py-4 px-6 rounded-xl outline-none transition-colors placeholder:text-zinc-700 font-light"
            />
            <button 
              type="submit"
              disabled={!customTask}
              className="px-8 py-4 text-xs font-bold tracking-widest uppercase text-black bg-white hover:bg-blue-400 disabled:opacity-30 disabled:hover:bg-white transition-colors rounded-xl whitespace-nowrap"
            >
              Initialize Deep Work
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}