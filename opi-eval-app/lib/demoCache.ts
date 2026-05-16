// Shared in-memory cache for demo mode - survives hot reloads via globalThis
declare global {
  var evaluationCacheInstance: Map<string, any>;
}

if (!global.evaluationCacheInstance) {
  global.evaluationCacheInstance = new Map<string, any>();
}

export const evaluationCache = global.evaluationCacheInstance;
