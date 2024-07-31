import vitePluginString from 'vite-plugin-string'

export default {
  plugins: [
    vitePluginString({
      include: [
        '**/*.html',
      ],
      exclude: 'node_modules/**',
    }),
  ],
  build: {
    sourcemap: true,
  }
}
