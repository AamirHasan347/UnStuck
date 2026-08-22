const BLACKLIST = [
  "instagram.com",
  "reddit.com",
  "twitter.com",
  "x.com",
  "tiktok.com",
  "netflix.com"
];

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only trigger if the URL is changing
  if (!changeInfo.url) return;

  // Check if a study session is actively running
  const { isSessionActive, currentTask } = await chrome.storage.local.get(["isSessionActive", "currentTask"]);
  
  if (isSessionActive) {
    const urlString = changeInfo.url.toLowerCase();
    
    try {
      const url = new URL(urlString);
      
      // Block pure distractors AND YouTube Shorts (but allow normal YouTube lectures)
      const isBlocked = BLACKLIST.some(domain => url.hostname.includes(domain)) || urlString.includes("youtube.com/shorts");
      
      if (isBlocked) {
        console.log("Distraction intercepted:", urlString);
        
        // The bounce-back URL
        const studyRoomUrl = `http://localhost:3000/study-room?task=${encodeURIComponent(currentTask || 'Focus Session')}`;
        
        // Instantly redirect the tab
        chrome.tabs.update(tabId, { url: studyRoomUrl });
      }
    } catch (e) {
      // Ignore invalid URLs
    }
  }
});