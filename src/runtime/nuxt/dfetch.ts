import { useRuntimeConfig } from '#imports'
import { useDfetch as createClient } from '../client'

export function useDfetch(options: Partial<ReturnType<typeof useRuntimeConfig>['discofetch']> = {}) {
  return createClient({
    ...(useRuntimeConfig().discofetch
      ? useRuntimeConfig().discofetch
      : useRuntimeConfig().public.discofetch),
    ...options,
  })
}
