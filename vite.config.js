import vitePluginString from 'vite-plugin-string'

export default {
  plugins: [
    vitePluginString({
      include: [
        'src/**/*.htmlt',
      ],
      exclude: 'node_modules/**',
    }),
  ],
  build: {
    sourcemap: true,
  }
}
