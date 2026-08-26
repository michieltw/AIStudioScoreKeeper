const CACHE_PREFIX = 'gas_cache_';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  timestamp: number;
  data: any;
}

// Keep track of pending requests by cache key
const pendingRequests = new Map<string, Promise<Response>>();

export const clearGasCache = () => {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (e) {
    console.warn('Failed to clear gas cache', e);
  }
};

export const fetchGasData = async (
  url: string,
  payload: any,
  forceRefresh = false
): Promise<Response> => {
  const action = payload?.action;
  let cacheKey: string | null = null;

  // Cache all 'get' actions by default
  if (action && action.startsWith('get')) {
    cacheKey = CACHE_PREFIX + JSON.stringify(payload);
  }

  // If we are doing a write operation, clear the cache
  if (action && !action.startsWith('get')) {
    clearGasCache();
  }

  if (cacheKey && !forceRefresh) {
    try {
      const cachedStr = localStorage.getItem(cacheKey);
      if (cachedStr) {
        const cached: CacheEntry = JSON.parse(cachedStr);
        if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
          // Return a mocked Response object
          return new Response(JSON.stringify(cached.data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    } catch (e) {
      console.warn('Cache read error', e);
    }

    // If a request for this payload is already in flight, return its promise
    if (pendingRequests.has(cacheKey)) {
      // Need to clone the response of the pending promise so multiple callers can read the stream
      return pendingRequests.get(cacheKey)!.then(res => res.clone());
    }
  }

  // Perform actual fetch
  const fetchPromise = fetch(url, {
    method: 'POST',
    body: JSON.stringify(payload)
  }).then(async (response) => {
    // If it's a cacheable request and successful, store it in cache
    if (cacheKey && response.ok) {
      // Clone response so we can read it and still return it
      const clone = response.clone();
      try {
        const data = await clone.json();
        const entry: CacheEntry = {
          timestamp: Date.now(),
          data
        };
        localStorage.setItem(cacheKey, JSON.stringify(entry));
      } catch (e) {
        console.warn('Failed to cache gas response', e);
      }
    }
    return response;
  }).finally(() => {
    if (cacheKey) {
      pendingRequests.delete(cacheKey);
    }
  });

  if (cacheKey) {
    pendingRequests.set(cacheKey, fetchPromise);
    // Clone it so the caller can read the json without consuming the shared response stream
    return fetchPromise.then(res => res.clone());
  }

  return fetchPromise;
};
