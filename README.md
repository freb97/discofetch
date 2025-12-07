# 🪩 Discofetch

[![Github Actions][github-actions-src]][github-actions-href]
[![NPM version][npm-version-src]][npm-version-href]
[![NPM last update][npm-last-update-src]][npm-last-update-href]
[![License][license-src]][license-href]

Discofetch is a type-safe fetch client that automatically discovers and generates TypeScript
types for REST APIs that lack OpenAPI specifications.
Instead of manually writing types or dealing with `any`, Discofetch probes your API endpoints
at build time and creates a fully-typed fetch client for runtime use with zero overhead.

## Features

- 🔍 **Automatic type discovery** - No manual type definitions needed
- 🛡️ **Full type safety** - TypeScript types for paths, parameters, and responses
- 🚀 **Framework integrations** - Built-in support for Nuxt (Vite coming soon)
- 🎯 **Runtime validation** - Optional Zod schema generation for response validation
- 🔧 **Customizable** - Hooks for customizing the discovery process
- ⚡ **Build-time generation** - Zero runtime overhead for type discovery

## How It Works

Discofetch is built on top of [autodisco](https://github.com/freb97/autodisco),
which automatically generates OpenAPI schemas by sending probe requests to your API endpoints
and analyzing the responses. The workflow is:

1. **Discovery Phase** (Build time): You define which endpoints to probe with sample parameters
2. **Type Generation** (Build time): [autodisco](https://github.com/freb97/autodisco) infers the API structure and generates TypeScript types using [openapi-typescript](https://github.com/openapi-ts/openapi-typescript)
3. **Type-Safe Client** (Runtime): A fetch client powered by [openapi-fetch](https://github.com/openapi-ts/openapi-typescript/tree/main/packages/openapi-fetch) provides fully-typed methods for your API

This gives you autocompletion, type checking, and IntelliSense for legacy APIs without manual type definitions.

## Installation

Install the module:

```sh
npm install discofetch
```

### Nuxt

Add it to your Nuxt config:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['discofetch/nuxt'],
})
```

### Vite

Update your tsconfig.json:

```json
{
  "include": [
    "node_modules/.discofetch/index.d.ts"
  ]
}
```

## Usage

### Basic Nuxt Setup

Configure the module with your API base URL and define probes for the endpoints you want to discover:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  discofetch: {
    // Base URL for your API
    baseUrl: 'https://jsonplaceholder.typicode.com',

    // Define endpoints to probe
    probes: {
      get: {
        '/todos': {},
        '/todos/{id}': {
          params: { id: 1 },
        },
        '/comments': {
          query: { postId: 1 },
        },
      },
      post: {
        '/todos': {
          body: {
            title: 'Sample Todo',
            completed: false,
            userId: 1,
          },
        },
      },
    },

    // Whether the generated client should only be available server-side (nitro) - default: false
    private: false,
  },
})
```

### Using the Generated Client with Nuxt

Once configured, use the `dfetch` composable anywhere in your Nuxt app:

```html
<script setup lang="ts">
const dfetch = useDfetch()

// GET request with path parameters
const { data: todo } = await dfetch.GET('/todos/{id}', {
  params: {
    path: { id: 1 },
  },
})

// GET request with query parameters
const { data: comments } = await dfetch.GET('/comments', {
  params: {
    query: { postId: 1 },
  },
})

// POST request with body
const { data: newTodo } = await dfetch.POST('/todos', {
  body: {
    title: 'New Todo',
    completed: false,
    userId: 1,
  },
})

// You can also access the generated TypeScript types directly
type Todos = DfetchComponents['schemas']['Todos']
type Body = DfetchPaths['/todos']['post']['requestBody']

console.log(todo.title) // ✅ Fully typed!
</script>
```

The `useDfetch` composable provides methods for all HTTP verbs you defined probes for, complete with type safety and autocompletion.
It is also available on the server side during SSR and in Nitro API routes.

### Basic Vite Setup

Add the plugin to your Vite config:

```ts
// vite.config.ts
import discofetch from 'discofetch/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    discofetch({
      // Base URL for your API
      baseUrl: 'https://jsonplaceholder.typicode.com',

      // Define endpoints to probe
      probes: {
        get: {
          '/todos': {},
          '/todos/{id}': {
            params: { id: 1 },
          },
          '/comments': {
            query: { postId: 1 },
          },
        },
        post: {
          '/todos': {
            body: {
              title: 'Sample Todo',
              completed: false,
              userId: 1,
            },
          },
        },
      },

      // Whether the generated client should exclude headers given in the vite config - default: false
      private: false,
    })
  ]
})
```

### Using the generated client with Vite

Once configured, you can import a preconfigured `dfetch` instance or create your own with custom configs:

```ts
import { createDfetch, dfetch } from 'discofetch/client'

// GET request with path parameters
const { data: todo } = await dfetch.GET('/todos/{id}', {
  params: {
    path: { id: 10 },
  },
})

const customDfetchClient = createDfetch({
  headers: {
    'my-custom-header': 'my custom header value!'
  }
})

const { data: newTodo } = await customDfetchClient.POST('/todos', {
  body: {
    title: 'New Todo Item',
    completed: true,
    userId: 2,
  },
})
```

## Configuration

### Probe Configuration

Each probe defines how to call an endpoint during discovery. Probes support:

- **`params`**: Path parameters (e.g., `{ id: 1 }` for `/users/{id}`)
- **`query`**: Query parameters (e.g., `{ page: 1, limit: 10 }`)
- **`body`**: Request body (for POST, PUT, PATCH requests)
- **`headers`**: Custom headers (overrides default headers)

```ts
export default defineNuxtConfig({
  discofetch: {
    baseUrl: 'https://api.example.com',

    // Global headers for all requests
    headers: {
      Authorization: 'Bearer token123',
    },

    probes: {
      get: {
        '/users/{id}': {
          params: { id: 1 },
          headers: {
            'X-Custom-Header': 'value',
          },
        },
        '/posts': {
          query: {
            page: 1,
            limit: 10,
            sort: 'created_at',
          },
        },
      },
      post: {
        '/users': {
          body: {
            name: 'John Doe',
            email: 'john@example.com',
          },
        },
      },
      put: {
        '/users/{id}': {
          params: { id: 1 },
          body: {
            name: 'Jane Doe',
          },
        },
      },
      delete: {
        '/users/{id}': {
          params: { id: 1 },
        },
      },
    },

    // Additional options
  },
})
```

### Hooks Reference

Hooks allow you to customize the discovery process at various stages. All hooks from [autodisco](https://github.com/freb97/autodisco) are available:

| Hook Name               | Props                                            | Description                                           |
|-------------------------|--------------------------------------------------|-------------------------------------------------------|
| `discovery:start`       | `config`                                         | Called when the discovery process begins              |
| `probe:request`         | `method`, `path`, `config`                       | Called before each API probe request is made          |
| `probe:response`        | `method`, `path`, `config`, `response`           | Called after each API probe response is received      |
| `probes:completed`      | `config`, `results`                              | Called when all API probing is complete               |
| `zod:generate`          | `method`, `name`, `inputData`, `rendererOptions` | Called before generating Zod schemas using quicktype  |
| `zod:generated`         | `config`                                         | Called after Zod schema files have been generated     |
| `zod:runtime:generate`  | `method`, `path`, `config`, `sample`             | Called before generating runtime Zod schemas          |
| `zod:runtime:generated` | `config`, `results`                              | Called after runtime Zod schemas have been generated  |
| `openapi:generate`      | `config`, `components`, `paths`                  | Called before generating the OpenAPI schema           |
| `openapi:generated`     | `config`, `result`                               | Called after the OpenAPI schema has been generated    |
| `typescript:generate`   | `config`, `openapiTSOptions`                     | Called before generating TypeScript types             |
| `typescript:generated`  | `config`, `result`                               | Called after TypeScript types have been generated     |
| `discovery:completed`   | `config`, `totalTime`, `totalProbingTime`        | Called when the entire discovery process is completed |

Example usage:

```ts
export default defineNuxtConfig({
  discofetch: {
    baseUrl: 'https://api.example.com',

    probes: {
      get: {
        '/users': {},
      },
    },

    hooks: {
      'discovery:start': (config) => {
        console.log('Starting API discovery...')
      },
      'probe:request': (method, path, config) => {
        console.log(`Probing ${method.toUpperCase()} ${path}`)
      },
      'probes:completed': (config, results) => {
        console.log(`Probed ${results.length} endpoints`)
      },
      'typescript:generated': (config, result) => {
        console.log('TypeScript types generated!')
      },
      'discovery:completed': (config, totalTime, totalProbingTime) => {
        console.log(`Discovery completed in ${totalTime}ms`)
      },
    },
  },
})
```

### Advanced Options

```ts
export default defineNuxtConfig({
  discofetch: {
    baseUrl: 'https://api.example.com',

    probes: {
      get: { '/users': {} },
    },

    // Generate Zod schemas for runtime validation
    generate: {
      zod: false, // Enable Zod schema generation
      typescript: { // Options for openapi-typescript
        strictNullChecks: true,
        // Other options...
      },
    },

    // Custom logger configuration (uses Consola)
    logger: {
      level: 3, // 0: silent, 1: error, 2: warn, 3: info, 4: debug
    },
  },
})
```

## Why Discofetch?

### Problem

You're working with a legacy API that:
- Has no OpenAPI specification
- Has no TypeScript types
- Has outdated or missing documentation
- Returns `any` types everywhere, making your code error-prone

### Solution

Discofetch automatically:
1. **Probes your API** endpoints with sample requests at build time
2. **Infers the structure** of requests and responses
3. **Generates TypeScript types** from the inferred structure
4. **Creates a typed fetch client** that you use at runtime

This means you get full type safety and autocomplete for legacy APIs without manually writing a single type definition.

### When not to use Discofetch

Discofetch may not be the best fit if:

- Your API is well-documented and has a complete OpenAPI specification.
- You have the resources to maintain TypeScript types manually.
- You prefer a more traditional approach to API client generation.

## Acknowledgements

This project is built with the following libraries:

- [autodisco](https://github.com/freb97/autodisco) - Automatic REST API discovery and OpenAPI generation
- [openapi-fetch](https://github.com/openapi-ts/openapi-typescript/tree/main/packages/openapi-fetch) - Type-safe fetch client
- [openapi-typescript](https://github.com/openapi-ts/openapi-typescript) - TypeScript types from OpenAPI schemas
- [zod-openapi](https://github.com/samchungy/zod-openapi) - OpenAPI schemas from Zod

## 📜 License

Published under the [MIT License](https://github.com/freb97/discofetch/tree/main/LICENSE).

[github-actions-src]: https://github.com/freb97/discofetch/actions/workflows/test.yml/badge.svg
[github-actions-href]: https://github.com/freb97/discofetch/actions

[npm-version-src]: https://img.shields.io/npm/v/discofetch/latest.svg?style=flat&colorA=18181B&colorB=31C553
[npm-version-href]: https://npmjs.com/package/discofetch

[npm-last-update-src]: https://img.shields.io/npm/last-update/discofetch.svg?style=flat&colorA=18181B&colorB=31C553
[npm-last-update-href]: https://npmjs.com/package/discofetch

[license-src]: https://img.shields.io/github/license/freb97/discofetch.svg?style=flat&colorA=18181B&colorB=31C553
[license-href]: https://github.com/freb97/discofetch/tree/main/LICENSE
