const BASE_URL = (window as any).__OVVYCMB__?.apiUrl ?? '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`)
  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  accounts: {
    list: () => request<any[]>('/accounts'),
    get: (id: string) => request<any>(`/accounts/${id}`),
    create: (data: { name: string; characterName: string; gameType: string; server?: string; colorTag?: string }) =>
      request<any>('/accounts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<any>) =>
      request<any>(`/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/accounts/${id}`, { method: 'DELETE' }),
    focus: (id: string) => request<{ success: boolean }>(`/accounts/${id}/focus`, { method: 'POST' }),
  },
  layouts: {
    list: () => request<any[]>('/layouts'),
    create: (data: { name: string; description?: string; hotkey?: string; monitorCount: number }) =>
      request<any>('/layouts', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/layouts/${id}`, { method: 'DELETE' }),
    apply: (id: string) => request<{ success: boolean }>(`/layouts/${id}/apply`, { method: 'POST' }),
    autoGenerate: (monitorIndex?: number) =>
      request<any>(`/layouts/auto-generate${monitorIndex !== undefined ? `?monitorIndex=${monitorIndex}` : ''}`, { method: 'POST' }),
  },
  system: {
    health: () => request<any>('/system/health'),
    monitors: () => request<any[]>('/system/monitors'),
    clients: () => request<any[]>('/system/clients'),
  },
  events: {
    recent: () => request<any[]>('/events'),
  },
}
