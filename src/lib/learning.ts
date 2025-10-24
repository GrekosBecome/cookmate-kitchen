import { Signal, LearningState } from '@/types';

const MAX_SIGNALS = 500;
const DECAY_DAYS = 7;
const DECAY_FACTOR = 0.9;
const MIN_WEIGHT = -8;
const MAX_WEIGHT = 12;
const MIN_DISPLAY_WEIGHT = 0.5;

const SIGNAL_DELTAS: Record<Signal['type'], number> = {
  'accepted': 2,
  'skip': -2,
  'another': -1,
  'viewed': 0,
};

export function recordSignal(signal: Signal, existingSignals: Signal[]): Signal[] {
  const signals = [...existingSignals, signal];
  
  // Keep only last MAX_SIGNALS
  if (signals.length > MAX_SIGNALS) {
    return signals.slice(-MAX_SIGNALS);
  }
  
  return signals;
}

export function recomputeLearning(signals: Signal[], currentLearning?: LearningState): LearningState {
  const now = new Date().toISOString();
  
  // Initialize or get existing weights
  let tagWeights: Record<string, number> = currentLearning?.tagWeights || {};
  let tagDecayAnchor = currentLearning?.tagDecayAnchor || now;
  
  // Apply decay if needed
  const daysSinceDecay = currentLearning?.tagDecayAnchor
    ? (new Date(now).getTime() - new Date(currentLearning.tagDecayAnchor).getTime()) / (1000 * 60 * 60 * 24)
    : 0;
  
  if (daysSinceDecay >= DECAY_DAYS) {
    Object.keys(tagWeights).forEach(tag => {
      tagWeights[tag] = clamp(tagWeights[tag] * DECAY_FACTOR, MIN_WEIGHT, MAX_WEIGHT);
    });
    tagDecayAnchor = now;
  }
  
  // Process signals that haven't been processed yet
  const lastUpdated = currentLearning?.lastUpdated;
  const newSignals = lastUpdated
    ? signals.filter(s => s.ts > lastUpdated)
    : signals;
  
  newSignals.forEach(signal => {
    const delta = SIGNAL_DELTAS[signal.type];
    
    if (delta !== 0 && signal.tags) {
      signal.tags.forEach(tag => {
        const current = tagWeights[tag] || 0;
        tagWeights[tag] = clamp(current + delta, MIN_WEIGHT, MAX_WEIGHT);
      });
    }
  });
  
  return {
    tagWeights,
    tagDecayAnchor,
    lastUpdated: now,
  };
}

export function getTagBoost(tag: string, learning?: LearningState): number {
  if (!learning) return 0;
  return learning.tagWeights[tag] || 0;
}

export function summarizeLikes(learning?: LearningState): string[] {
  if (!learning) return [];
  
  const tags = Object.entries(learning.tagWeights)
    .filter(([_, weight]) => weight > 1.5)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 3)
    .map(([tag]) => tag);
  
  return tags;
}

export function getTopTags(learning?: LearningState, limit = 5): Array<{ tag: string; weight: number }> {
  if (!learning) return [];
  
  return Object.entries(learning.tagWeights)
    .filter(([_, weight]) => Math.abs(weight) >= MIN_DISPLAY_WEIGHT)
    .sort(([_, a], [__, b]) => Math.abs(b) - Math.abs(a))
    .slice(0, limit)
    .map(([tag, weight]) => ({ tag, weight }));
}

export function getWhyThisReasons(recipeTags: string[], learning?: LearningState): string[] {
  if (!learning) return [];
  
  const reasons = recipeTags
    .map(tag => ({ tag, weight: getTagBoost(tag, learning) }))
    .filter(({ weight }) => weight > 1.5)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 2)
    .map(({ tag }) => tag);
  
  return reasons;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
