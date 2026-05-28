import { useEffect, useRef } from 'react'
import { startConnection, onEvent, stopConnection } from '@/api/signalrClient'
import { useAppStore } from '@/stores/appStore'
import { api } from '@/api/apiClient'
import type { DomainEvent } from '@/types'

export function useSignalR() {
  const { setConnected, addEvent, setAccounts } = useAppStore()
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    let cleanup: (() => void)[] = []

    const init = async () => {
      try {
        await startConnection()
        setConnected(true)

        cleanup.push(onEvent('*', (evt: DomainEvent) => {
          addEvent(evt)
        }))

        cleanup.push(onEvent('AccountStatusChanged', async () => {
          const accounts = await api.accounts.list()
          setAccounts(accounts)
        }))

        cleanup.push(onEvent('AccountDetected', async () => {
          const accounts = await api.accounts.list()
          setAccounts(accounts)
        }))

        cleanup.push(onEvent('AccountLost', async () => {
          const accounts = await api.accounts.list()
          setAccounts(accounts)
        }))
      } catch (err) {
        console.error('[SignalR] Failed to connect:', err)
        setConnected(false)
        setTimeout(init, 3000)
      }
    }

    init()

    return () => {
      cleanup.forEach(fn => fn())
      stopConnection()
    }
  }, [])
}
