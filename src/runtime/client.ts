import type { components, paths } from 'discofetch/types/client'

import createClient from 'openapi-fetch'

export function useDfetch(options?: Parameters<typeof createClient>[0]) {
  return createClient<paths>(options)
}

export const dfetch = /* #__PURE__ */ useDfetch()

export type {
  components as DfetchComponents,
  paths as DfetchPaths,
}
