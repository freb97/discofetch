import type { DiscoverConfig } from 'autodisco'

import { stat } from 'node:fs/promises'
import { addImports, addServerImports, addTemplate, createResolver, defineNuxtModule, updateRuntimeConfig, useLogger } from '@nuxt/kit'
import discover from 'autodisco'

import { getRuntimeConfig } from './config/runtime'
import { augmentClient } from './templates/augment'

export interface ModuleOptions extends DiscoverConfig {
  /**
   * If set to true, the generated client will only be available on the server side.
   */
  private?: boolean
}

declare module '@nuxt/schema' {
  interface RuntimeConfig {
    discofetch: Pick<ModuleOptions, 'baseUrl' | 'headers'>
  }

  interface PublicRuntimeConfig {
    discofetch: Pick<ModuleOptions, 'baseUrl' | 'headers'>
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'discofetch',
    configKey: 'discofetch',
  },

  setup: async (options, nuxt) => {
    const resolver = createResolver(import.meta.url)
    const logger = useLogger('discofetch')

    const clientSource = resolver.resolve('../src/client/index.d.ts')

    if (await stat(clientSource).catch(() => false)) {
      logger.info('Source files detected, enabling module aliases for development mode.')

      nuxt.options.alias = nuxt.options.alias ??= {}
      nuxt.options.alias['discofetch/types/client'] = clientSource

      nuxt.options.nitro.typescript ??= {}
      nuxt.options.nitro.typescript.tsConfig ??= {}
      nuxt.options.nitro.typescript.tsConfig.include ??= []
      nuxt.options.nitro.typescript.tsConfig.include.push(clientSource)
    }

    if (!options.probes) {
      logger.info('No options provided, skipping auto-discovery.')

      return
    }

    const outputDir = `${nuxt.options.buildDir}/discofetch`

    await discover({
      ...options,

      generate: {
        zod: options.generate?.zod ?? false,
        typescript: options.generate?.typescript ?? true,
      },

      outputDir: options.outputDir ?? outputDir,
    })

    addTemplate({
      filename: `${outputDir}/index.d.ts`,
      getContents: () => augmentClient(),
      write: true,
    })

    const imports = [
      {
        from: resolver.resolve('./runtime/nuxt/dfetch'),
        name: 'useDfetch',
      },
      {
        from: resolver.resolve('./runtime/client'),
        name: 'DfetchComponents',
        type: true,
      },
      {
        from: resolver.resolve('./runtime/client'),
        name: 'DfetchPaths',
        type: true,
      },
    ]

    addServerImports(imports)
    addImports(imports)

    updateRuntimeConfig({
      discofetch: getRuntimeConfig(options),
    })

    nuxt.options.nitro.typescript ??= {}
    nuxt.options.nitro.typescript.tsConfig ??= {}
    nuxt.options.nitro.typescript.tsConfig.include ??= []
    nuxt.options.nitro.typescript.tsConfig.include.push(outputDir)

    nuxt.options.typescript.tsConfig.include ??= []
    nuxt.options.typescript.tsConfig.include.push(outputDir)

    if (!options.private) {
      updateRuntimeConfig({
        public: { discofetch: getRuntimeConfig(options) },
      })
    }
  },
})
