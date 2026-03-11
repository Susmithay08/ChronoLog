import { create } from 'zustand'
const API = '/api'

export const useStore = create((set, get) => ({
  logs: [],
  stats: null,
  view: 'journal', // journal | new | stats | digest
  digest: null,
  digestLoading: false,

  fetchLogs: async () => {
    const r = await fetch(`${API}/logs`)
    const data = await r.json()
    set({ logs: data })
  },

  fetchStats: async () => {
    const r = await fetch(`${API}/stats`)
    const data = await r.json()
    set({ stats: data })
  },

  addLog: async (payload) => {
    const r = await fetch(`${API}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await r.json()
    set(s => ({ logs: [data, ...s.logs], view: 'journal' }))
    get().fetchStats()
    return data
  },

  deleteLog: async (id) => {
    await fetch(`${API}/logs/${id}`, { method: 'DELETE' })
    set(s => ({ logs: s.logs.filter(l => l.id !== id) }))
    get().fetchStats()
  },

  generateDigest: async () => {
    set({ digestLoading: true })
    try {
      const r = await fetch(`${API}/digest`, { method: 'POST' })
      const data = await r.json()
      set({ digest: data, digestLoading: false, view: 'digest' })
    } catch { set({ digestLoading: false }) }
  },

  setView: (v) => set({ view: v }),
}))
