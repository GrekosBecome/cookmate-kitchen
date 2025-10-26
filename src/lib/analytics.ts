import { AnalyticsEvent } from '@/types/memory';

const STORAGE_KEY = 'cookmate-analytics';

export function track(event: string, data?: Record<string, any>) {
  try {
    const logs: AnalyticsEvent[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    logs.push({ event, data, ts: new Date().toISOString() });
    
    // Keep only last 1000 events to prevent storage bloat
    const trimmed = logs.slice(-1000);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.warn('Analytics tracking failed:', error);
  }
}

export function getAnalytics(): AnalyticsEvent[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function clearAnalytics() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getInsights() {
  const events = getAnalytics();
  
  const screenOpens = events.filter(e => e.event === 'opened_screen');
  const ctaClicks = events.filter(e => e.event === 'clicked_cta');
  const chatMessages = events.filter(e => e.event === 'chat_message_sent');
  const recipesCompleted = events.filter(e => e.event === 'recipe_completed');
  const pantryScans = events.filter(e => e.event === 'pantry_scan');
  
  const lastCooking = recipesCompleted[recipesCompleted.length - 1]?.ts;
  const totalSessions = screenOpens.length;
  
  const favoriteActions: Record<string, number> = {};
  ctaClicks.forEach(e => {
    const action = e.data?.action || 'unknown';
    favoriteActions[action] = (favoriteActions[action] || 0) + 1;
  });
  
  return {
    totalSessions,
    screenOpens: screenOpens.length,
    ctaClicks: ctaClicks.length,
    chatMessages: chatMessages.length,
    recipesCompleted: recipesCompleted.length,
    pantryScans: pantryScans.length,
    lastCookingDate: lastCooking,
    favoriteActions,
    recentEvents: events.slice(-20).reverse(),
  };
}
