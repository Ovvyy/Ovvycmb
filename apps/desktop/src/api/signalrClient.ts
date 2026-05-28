import * as signalR from '@microsoft/signalr'
import type { DomainEvent } from '@/types'

const WS_URL = (window as any).__OVVYCMB__?.wsUrl ?? '/hub'

let connection: signalR.HubConnection | null = null
const handlers = new Map<string, Set<(event: DomainEvent) => void>>()

export function getConnection(): signalR.HubConnection {
  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(WS_URL)
      .withAutomaticReconnect([0, 1000, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    connection.on('event', (evt: DomainEvent) => {
      const all = handlers.get('*')
      if (all) all.forEach(h => h(evt))
      const specific = handlers.get(evt.type)
      if (specific) specific.forEach(h => h(evt))
    })

    connection.onreconnecting(() => console.log('[SignalR] Reconnecting...'))
    connection.onreconnected(() => console.log('[SignalR] Reconnected'))
    connection.onclose(() => console.log('[SignalR] Connection closed'))
  }
  return connection
}

export async function startConnection(): Promise<void> {
  const conn = getConnection()
  if (conn.state === signalR.HubConnectionState.Disconnected) {
    await conn.start()
    console.log('[SignalR] Connected to Ovvycmb hub')
  }
}

export function onEvent(type: string | '*', handler: (event: DomainEvent) => void): () => void {
  if (!handlers.has(type)) handlers.set(type, new Set())
  handlers.get(type)!.add(handler)
  return () => handlers.get(type)?.delete(handler)
}

export async function stopConnection(): Promise<void> {
  await connection?.stop()
}
