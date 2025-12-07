export function augmentClient() {
  return `
import type { components as GeneratedComponents, paths as GeneratedPaths } from './typescript/types.d.ts'

declare module 'discofetch/types/client' {
  interface components extends GeneratedComponents {}
  interface paths extends GeneratedPaths {}
}
`.trim()
}
