import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import handler from './api/admin.ts'

function adminApiDevPlugin(): Plugin {
  return {
    name: 'admin-api-dev-middleware',
    configureServer(server) {
      server.middlewares.use('/api/admin', async (req, res) => {
        let body = ''
        req.on('data', (chunk) => (body += chunk))
        req.on('end', async () => {
          ;(req as any).body = body
          ;(res as any).status = (code: number) => {
            res.statusCode = code
            return {
              json: (data: any) => {
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify(data))
              },
              end: () => res.end(),
            }
          }
          ;(res as any).json = (data: any) => {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(data))
          }
          try {
            await handler(req, res)
          } catch (e: any) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: e.message }))
          }
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), adminApiDevPlugin()],
})
