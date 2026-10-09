import { useSyncExternalStore } from 'react'
import { getSyncStatus, subscribeSync } from './sync'

export function useSyncStatus() {
  return useSyncExternalStore(subscribeSync, getSyncStatus, getSyncStatus)
}
