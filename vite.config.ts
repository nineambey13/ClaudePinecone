import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import type { IncomingMessage } from 'http';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api/claude': {
        target: 'https://api.anthropic.com/v1',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/claude/, '/messages'),
        headers: {
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req: IncomingMessage & { body?: any }, _res) => {
            if (req.body) {
              const bodyData = JSON.stringify(req.body);
              proxyReq.setHeader('Content-Type', 'application/json');
              proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
              proxyReq.setHeader('anthropic-version', '2023-06-01');
              proxyReq.setHeader('anthropic-dangerous-direct-browser-access', 'true');
              proxyReq.write(bodyData);
            }
          });
          
          proxy.on('proxyRes', (proxyRes, req, res) => {
            proxyRes.headers['anthropic-dangerous-direct-browser-access'] = 'true';
          });
        }
      }
    }
  },
  plugins: [
    react(),
    process.env.NODE_ENV === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
