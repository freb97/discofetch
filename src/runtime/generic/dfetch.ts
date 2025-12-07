import type { DfetchComponents, DfetchPaths } from '../client'
import { useDfetch as createClient } from '../client'

declare const __DISCOFETCH_CONFIG__: { baseUrl?: string, headers?: Record<string, string> } | undefined

export function createDfetch(options: { baseUrl?: string, headers?: Record<string, string> } = {}) {
  const config = typeof __DISCOFETCH_CONFIG__ !== 'undefined' ? __DISCOFETCH_CONFIG__ : {}

  return createClient({
    baseUrl: config?.baseUrl,
    headers: config?.headers,
    ...options,
  })
}

export const dfetch = /* #__PURE__ */ createDfetch()

export type {
  DfetchComponents,
  DfetchPaths,
}
