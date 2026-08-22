// apps/extension/contents/study-room-sync.ts
import type { PlasmoCSConfig } from "plasmo"

// Inject this listener only into your web app
export const config: PlasmoCSConfig = {
  matches: ["http://localhost:3000/*"] 
}

// Listen for the specific End Session message
window.addEventListener("message", async (event) => {
  if (event.data?.action === "UNSTUCK_END_SESSION") {
    console.log("UnStuck Extension: Session Disarmed.");
    
    // Turn off the tab blocker
    await chrome.storage.local.set({ 
      isSessionActive: false,
      currentTask: null
    });
  }
});