"use client"

import { useSearchParams } from "next/navigation"
import { useState, Suspense, useEffect, useRef } from "react"
import ReactMarkdown from "react-markdown"

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CoachContent = () => {
  const searchParams = useSearchParams()
  const mood = searchParams.get("mood") || "overwhelmed"
  
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  // Initial trigger
  useEffect(() => {
    if (!hasStarted) {
      setHasStarted(true)
      handleSend("I am feeling " + mood + " right now and need to reset.")
    }
  }, [mood, hasStarted])

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const newMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, mood }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setMessages([...newMessages, { role: "assistant", content: `⚠️ System Error: ${data.error || 'Connection failed'}. Please check your Vercel logs.` }]);
      } else if (data.message) {
        setMessages([...newMessages, data.message]);
        
        // SILENT GRAPH UPDATE: If the AI detected a topic, log it into Supabase!
        if (data.metadata?.detected_topic) {
          fetch("/api/track-friction", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              topic: data.metadata.detected_topic,
              frictionDelta: data.metadata.friction_delta
            })
          }).catch(err => console.error("Graph tracking failed in background", err));
        }
      }
    } catch (error: any) {
      setMessages([...newMessages, { role: "assistant", content: `⚠️ Critical Error: Could not reach the server.` }]);
    }
    
    setIsLoading(false);
  }

  const handleGoToStudyRoom = () => {
    const task = prompt("What is your specific target?") || "Focus Session";
    window.location.href = `/study-room?task=${encodeURIComponent(task)}&mode=deepwork`;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* Top Bar */}
      <nav className="p-8 flex justify-between items-center border-b border-zinc-900">
        <div className="text-xs font-bold tracking-[0.2em] text-zinc-500 uppercase">
          UnStuck / Tactical Coach
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] tracking-widest text-emerald-500 uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Active Session
          </span>
        </div>
      </nav>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 max-w-3xl mx-auto w-full pb-32">
        {messages.filter(m => !m.content.startsWith("I am feeling")).map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[75%] p-6 ${
              msg.role === 'user' 
                ? 'bg-zinc-900 text-white rounded-2xl rounded-tr-sm border border-zinc-800' 
                : 'bg-transparent text-zinc-300'
            }`}>
              {msg.role === 'assistant' && (
                <div className="text-[10px] font-bold tracking-[0.2em] text-emerald-500 uppercase mb-3">AI Coach</div>
              )}
              <div className="text-lg font-light leading-relaxed">
                {msg.role === 'assistant' ? (
                  <ReactMarkdown
                    components={{
                      strong: ({node, ...props}) => <span className="font-semibold text-white" {...props} />,
                      p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-2 marker:text-emerald-500" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-2 marker:text-emerald-500" {...props} />,
                      li: ({node, ...props}) => <li className="pl-1" {...props} />
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Sleek Thinking Animation */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-transparent p-6">
              <div className="text-[10px] font-bold tracking-[0.2em] text-emerald-500 uppercase mb-3">AI Coach</div>
              <div className="flex gap-2 items-center h-6">
                <div className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 inset-x-0 bg-gradient-to-t from-black via-black to-transparent p-8 pt-12">
        <div className="max-w-3xl mx-auto w-full relative flex items-center gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder="What exactly is blocking you right now?"
            className="flex-1 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 focus:border-emerald-500 text-white py-4 px-6 rounded-xl outline-none transition-all placeholder:text-zinc-600 font-light"
          />
          <button 
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isLoading}
            className="px-6 py-4 bg-white text-black font-bold tracking-widest text-xs uppercase rounded-xl hover:bg-emerald-400 disabled:opacity-30 disabled:hover:bg-white transition-colors"
          >
            Send
          </button>
          
          <div className="w-px h-8 bg-zinc-800"></div>
          
          <button 
            onClick={handleGoToStudyRoom}
            className="px-6 py-4 border border-zinc-800 text-zinc-400 hover:text-white font-bold tracking-widest text-xs uppercase rounded-xl hover:border-white transition-colors whitespace-nowrap"
          >
            Deploy Plan
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CoachRoom() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-emerald-500 text-xs tracking-widest uppercase animate-pulse">Establishing Connection...</div>}>
      <CoachContent />
    </Suspense>
  )
}