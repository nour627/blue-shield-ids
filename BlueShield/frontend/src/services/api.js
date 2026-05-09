/**
 * BlueShield IDS — Centralized API service
 * All backend calls go through this file.
 */

const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text}`)
  }
  return res.json()
}

// ── Dashboard ──────────────────────────────────────────────────
export const api = {
  dashboard: {
    getStats: ()              => request('/dashboard/stats'),
    getAttackDistribution: () => request('/dashboard/attack-distribution'),
    getRecentAlerts: (limit = 10) => request(`/dashboard/recent-alerts?limit=${limit}`),
    getTrafficTimeline: ()    => request('/dashboard/traffic-timeline'),
  },
  liveTraffic: {
    getStream: (limit = 12)   => request(`/live-traffic/stream?limit=${limit}`),
  },
  alerts: {
    getAll: ()   => request('/alerts'),
    resolve: (id) => request(`/alerts/${id}/resolve`, { method: 'PATCH' }),
    block: (id)   => request(`/alerts/${id}/block`, { method: 'POST' }),
  },
  models: {
    compare: ()  => request('/models/compare'),
  },
  pcap: {
    upload: async (file) => {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/pcap/upload', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        throw new Error(`API ${res.status}: Upload failed`)
      }
      return res.json()
    }
  },
  tools: {
    search: (query) => request(`/tools/search?query=${query}`),
    ping: (host) => request(`/tools/ping?host=${host}`),
  }
}
