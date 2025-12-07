import type { DiscoverConfig } from 'autodisco'
import type { ConsolaOptions } from 'consola'
import type { UnpluginFactory } from 'unplugin'

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import discover from 'autodisco'
import { createUnplugin } from 'unplugin'

import { getRuntimeConfig } from './config/runtime'
import { augmentClient } from './templates/augment'

function createResolver(base: string) {
  const root = dirname(fileURLToPath(base))
  return {
    resolve: (...args: string[]) => resolve(root, ...args),
  }
}

export type PluginConfig = Omit<DiscoverConfig, 'logger'> & {
  logger?: ConsolaOptions

  /**
   * If set to true, the generated client will not pre-configure baseUrl or headers.
   */
  private?: boolean
}

export const unpluginFactory: UnpluginFactory<PluginConfig | undefined> = (options) => {
  const resolver = createResolver(import.meta.url)
  const outputDir = options?.outputDir || resolver.resolve('../../../.discofetch')

  return {
    name: 'unplugin-discofetch',

    async buildStart() {
      if (!options?.probes)
        return

      await discover({
        ...options,
        outputDir,
        generate: {
          zod: options.generate?.zod ?? false,
          typescript: options.generate?.typescript ?? true,
        },
      })

      await mkdir(outputDir, { recursive: true })

      await writeFile(
        resolve(outputDir, 'index.d.ts'),
        augmentClient(),
        'utf-8',
      )
    },

    resolveId(id) {
      if (id === 'discofetch/client')
        return 'virtual:discofetch/client'
    },

    load(id) {
      if (id === 'virtual:discofetch/client') {
        return `export * from '${resolver.resolve('../runtime/generic/dfetch.js')}'`
      }
    },

    vite: {
      config() {
        const config = options && !options.private ? getRuntimeConfig(options) : undefined

        return {
          define: {
            __DISCOFETCH_CONFIG__: JSON.stringify(config),
          },
        }
      },
    },
  }
}

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)

export default unplugin
