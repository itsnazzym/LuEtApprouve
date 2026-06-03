/// <reference types="chrome" />

// Cache to store domains we have already pinged recently (in memory)
const pingedDomains: Set<string> = new Set();
const activeTimers: Map<number, ReturnType<typeof setTimeout>> = new Map();

// Allowed TLDs to avoid pinging dev/local/edu/gov sites
const ALLOWED_TLDS = ['.com', '.fr', '.net', '.org', '.io', '.co', '.eu', '.info', '.biz', '.me', '.tv'];

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Clear any existing timer for this tab if the URL changed
  if (changeInfo.url || changeInfo.status === 'loading') {
    if (activeTimers.has(tabId)) {
      clearTimeout(activeTimers.get(tabId)!);
      activeTimers.delete(tabId);
    }
  }

  // Only trigger when the page is fully loaded
  if (changeInfo.status === 'complete' && tab.url) {
    try {
      const url = new URL(tab.url);
      
      // Ignore system and local urls
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return;
      
      const domain = url.hostname.replace(/^www\./, '');
      
      // TLD Filtering
      const isValidTLD = ALLOWED_TLDS.some(tld => domain.endsWith(tld));
      if (!isValidTLD) return;

      // Basic check to avoid spamming the same domain in the same session
      if (pingedDomains.has(domain)) return;

      // Set a 30-second timer to verify the user actually stayed on the site
      const timer = setTimeout(async () => {
        activeTimers.delete(tabId);
        
        // Verify if the tab still exists and is on the same domain
        try {
          const currentTab = await chrome.tabs.get(tabId);
          if (!currentTab || !currentTab.url) return;
          const currentUrl = new URL(currentTab.url);
          const currentDomain = currentUrl.hostname.replace(/^www\./, '');
          
          if (currentDomain !== domain) return; // User navigated away
          
          // Check storage for persistence across extension reloads (24 hours cache)
          const storageKey = `checked_${domain}`;
          const data = await chrome.storage.local.get(storageKey);
          
          const now = Date.now();
          if (data[storageKey] && (now - (data[storageKey] as number)) < 24 * 60 * 60 * 1000) {
            pingedDomains.add(domain);
            return;
          }

          // Add to cache
          pingedDomains.add(domain);
          await chrome.storage.local.set({ [storageKey]: now });

          console.log(`[LuEtApprouvé] Analyse autonome (30s) du domaine : ${domain}`);

          // Fetch with auto=true
          await fetch(`https://luetapprouve.vercel.app/api/check?domain=${domain}&force=false&auto=true`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
          });
        } catch (e) {
          // Tab might be closed
          console.error("[LuEtApprouvé] Timer execution error:", e);
        }
      }, 30000); // 30 seconds

      activeTimers.set(tabId, timer);
      
    } catch (e) {
      console.error("[LuEtApprouvé] Background check error:", e);
    }
  }
});

// Also clear timer if tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  if (activeTimers.has(tabId)) {
    clearTimeout(activeTimers.get(tabId)!);
    activeTimers.delete(tabId);
  }
});
