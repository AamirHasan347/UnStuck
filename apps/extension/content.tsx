// apps/extension/content.tsx
import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"
import { useState } from "react"
import { MoodSelector } from "./components/MoodSelector"
import { TwoMinuteRule } from "./components/TwoMinuteRule"
import { ActionPrompt } from "./components/ActionPrompt"

export const config: PlasmoCSConfig = {
  matches: ["*://*.youtube.com/*", "*://*.pw.live/*"],
  all_frames: true
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

type FlowState = 'MOOD_CHECK' | 'WARMUP' | 'ACTION_PROMPT' | 'HIDDEN';

const OverlayController = () => {
  const [currentStep, setCurrentStep] = useState<FlowState>('MOOD_CHECK')

  if (currentStep === 'HIDDEN') return null

  const handleMoodSelect = (mood: string) => {
    if (mood === "Overwhelmed" || mood === "Stressed") {
      setCurrentStep('WARMUP')
    } else {
      setCurrentStep('ACTION_PROMPT')
    }
  }

  const handleWarmupComplete = () => {
    setCurrentStep('ACTION_PROMPT')
  }

  const handleStartExtension = (task: string) => {
    console.log("Starting extension timer for:", task)
    // TODO: Send message to background service worker to start Pomodoro
    setCurrentStep('HIDDEN') 
  }

  const handleGoToStudyRoom = async (task: string) => {
    console.log("Teleporting to Study Room for:", task)
    
    // Arm the Tab Blocker
    await chrome.storage.local.set({ 
      isSessionActive: true, 
      currentTask: task 
    });
    
    window.location.href = `http://localhost:3000/study-room?task=${encodeURIComponent(task)}`
  }

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-zinc-900 border border-zinc-700/50 p-8 rounded-2xl shadow-2xl max-w-2xl w-full">
        
        {currentStep === 'MOOD_CHECK' && <MoodSelector onSelect={handleMoodSelect} />}
        {currentStep === 'WARMUP' && <TwoMinuteRule onComplete={handleWarmupComplete} />}
        {currentStep === 'ACTION_PROMPT' && (
          <ActionPrompt 
            onStartExtension={handleStartExtension} 
            onGoToStudyRoom={handleGoToStudyRoom} 
          />
        )}

      </div>
    </div>
  )
}

export default OverlayController