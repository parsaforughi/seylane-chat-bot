// API client for backend communication

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include', // Include cookies for session
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  auth: {
    login: (username: string, password: string) =>
      fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),
    logout: () => fetchAPI('/auth/logout', { method: 'POST' }),
    me: () => fetchAPI('/auth/me'),
    setup: (username: string, password: string) =>
      fetchAPI('/auth/setup', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),
  },

  // Conversations
  conversations: {
    list: (limit?: number, offset?: number) =>
      fetchAPI(`/api/conversations?limit=${limit || 50}&offset=${offset || 0}`),
    get: (id: number) => fetchAPI(`/api/conversations/${id}`),
  },

  // Analytics
  analytics: {
    overview: () => fetchAPI('/api/analytics/overview'),
    messagesOverTime: (days?: number) =>
      fetchAPI(`/api/analytics/messages-over-time?days=${days || 30}`),
    intentDistribution: () => fetchAPI('/api/analytics/intent-distribution'),
  },

  // Settings
  settings: {
    get: () => fetchAPI('/api/settings'),
    update: (settings: Record<string, string>) =>
      fetchAPI('/api/settings', {
        method: 'POST',
        body: JSON.stringify(settings),
      }),
  },

  // Logs
  logs: {
    list: (limit?: number) => fetchAPI(`/api/logs?limit=${limit || 100}`),
  },

  // Test connections
  test: {
    woocommerce: () => fetchAPI('/api/test/woocommerce'),
    openai: () => fetchAPI('/api/test/openai'),
    instagram: () => fetchAPI('/api/test/instagram'),
  },
};

