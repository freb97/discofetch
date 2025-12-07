import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,

  entries: [
    'src/module.ts',
    'src/adapters/vite.ts',

    {
      builder: 'mkdist',
      input: 'src/types',
      outDir: 'dist/types',
    },
  ],
})
