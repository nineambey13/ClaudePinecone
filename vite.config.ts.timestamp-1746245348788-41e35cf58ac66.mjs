// vite.config.ts
import { defineConfig } from "file:///C:/Users/mindo/Desktop/backup/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/mindo/Desktop/backup/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///C:/Users/mindo/Desktop/backup/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\mindo\\Desktop\\backup";
var vite_config_default = defineConfig({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api/claude": {
        target: "https://api.anthropic.com/v1",
        changeOrigin: true,
        secure: true,
        rewrite: (path2) => path2.replace(/^\/api\/claude/, "/messages"),
        headers: {
          "anthropic-dangerous-direct-browser-access": "true"
        },
        configure: (proxy, _options) => {
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            if (req.body) {
              const bodyData = JSON.stringify(req.body);
              proxyReq.setHeader("Content-Type", "application/json");
              proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
              proxyReq.setHeader("anthropic-version", "2023-06-01");
              proxyReq.setHeader("anthropic-dangerous-direct-browser-access", "true");
              proxyReq.write(bodyData);
            }
          });
          proxy.on("proxyRes", (proxyRes, req, res) => {
            proxyRes.headers["anthropic-dangerous-direct-browser-access"] = "true";
          });
        }
      }
    }
  },
  plugins: [
    react(),
    process.env.NODE_ENV === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxtaW5kb1xcXFxEZXNrdG9wXFxcXGJhY2t1cFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbWluZG9cXFxcRGVza3RvcFxcXFxiYWNrdXBcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL21pbmRvL0Rlc2t0b3AvYmFja3VwL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XG5pbXBvcnQgdHlwZSB7IEluY29taW5nTWVzc2FnZSB9IGZyb20gJ2h0dHAnO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgc2VydmVyOiB7XG4gICAgaG9zdDogXCI6OlwiLFxuICAgIHBvcnQ6IDgwODAsXG4gICAgcHJveHk6IHtcbiAgICAgICcvYXBpL2NsYXVkZSc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cHM6Ly9hcGkuYW50aHJvcGljLmNvbS92MScsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgc2VjdXJlOiB0cnVlLFxuICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpXFwvY2xhdWRlLywgJy9tZXNzYWdlcycpLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgJ2FudGhyb3BpYy1kYW5nZXJvdXMtZGlyZWN0LWJyb3dzZXItYWNjZXNzJzogJ3RydWUnXG4gICAgICAgIH0sXG4gICAgICAgIGNvbmZpZ3VyZTogKHByb3h5LCBfb3B0aW9ucykgPT4ge1xuICAgICAgICAgIHByb3h5Lm9uKCdwcm94eVJlcScsIChwcm94eVJlcSwgcmVxOiBJbmNvbWluZ01lc3NhZ2UgJiB7IGJvZHk/OiBhbnkgfSwgX3JlcykgPT4ge1xuICAgICAgICAgICAgaWYgKHJlcS5ib2R5KSB7XG4gICAgICAgICAgICAgIGNvbnN0IGJvZHlEYXRhID0gSlNPTi5zdHJpbmdpZnkocmVxLmJvZHkpO1xuICAgICAgICAgICAgICBwcm94eVJlcS5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgICAgICAgIHByb3h5UmVxLnNldEhlYWRlcignQ29udGVudC1MZW5ndGgnLCBCdWZmZXIuYnl0ZUxlbmd0aChib2R5RGF0YSkpO1xuICAgICAgICAgICAgICBwcm94eVJlcS5zZXRIZWFkZXIoJ2FudGhyb3BpYy12ZXJzaW9uJywgJzIwMjMtMDYtMDEnKTtcbiAgICAgICAgICAgICAgcHJveHlSZXEuc2V0SGVhZGVyKCdhbnRocm9waWMtZGFuZ2Vyb3VzLWRpcmVjdC1icm93c2VyLWFjY2VzcycsICd0cnVlJyk7XG4gICAgICAgICAgICAgIHByb3h5UmVxLndyaXRlKGJvZHlEYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICBcbiAgICAgICAgICBwcm94eS5vbigncHJveHlSZXMnLCAocHJveHlSZXMsIHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgICBwcm94eVJlcy5oZWFkZXJzWydhbnRocm9waWMtZGFuZ2Vyb3VzLWRpcmVjdC1icm93c2VyLWFjY2VzcyddID0gJ3RydWUnO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50JyAmJlxuICAgIGNvbXBvbmVudFRhZ2dlcigpLFxuICBdLmZpbHRlcihCb29sZWFuKSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICB9LFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQW1SLFNBQVMsb0JBQW9CO0FBQ2hULE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFIaEMsSUFBTSxtQ0FBbUM7QUFPekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsZUFBZTtBQUFBLFFBQ2IsUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsUUFBUTtBQUFBLFFBQ1IsU0FBUyxDQUFDQSxVQUFTQSxNQUFLLFFBQVEsa0JBQWtCLFdBQVc7QUFBQSxRQUM3RCxTQUFTO0FBQUEsVUFDUCw2Q0FBNkM7QUFBQSxRQUMvQztBQUFBLFFBQ0EsV0FBVyxDQUFDLE9BQU8sYUFBYTtBQUM5QixnQkFBTSxHQUFHLFlBQVksQ0FBQyxVQUFVLEtBQXVDLFNBQVM7QUFDOUUsZ0JBQUksSUFBSSxNQUFNO0FBQ1osb0JBQU0sV0FBVyxLQUFLLFVBQVUsSUFBSSxJQUFJO0FBQ3hDLHVCQUFTLFVBQVUsZ0JBQWdCLGtCQUFrQjtBQUNyRCx1QkFBUyxVQUFVLGtCQUFrQixPQUFPLFdBQVcsUUFBUSxDQUFDO0FBQ2hFLHVCQUFTLFVBQVUscUJBQXFCLFlBQVk7QUFDcEQsdUJBQVMsVUFBVSw2Q0FBNkMsTUFBTTtBQUN0RSx1QkFBUyxNQUFNLFFBQVE7QUFBQSxZQUN6QjtBQUFBLFVBQ0YsQ0FBQztBQUVELGdCQUFNLEdBQUcsWUFBWSxDQUFDLFVBQVUsS0FBSyxRQUFRO0FBQzNDLHFCQUFTLFFBQVEsMkNBQTJDLElBQUk7QUFBQSxVQUNsRSxDQUFDO0FBQUEsUUFDSDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sUUFBUSxJQUFJLGFBQWEsaUJBQ3pCLGdCQUFnQjtBQUFBLEVBQ2xCLEVBQUUsT0FBTyxPQUFPO0FBQUEsRUFDaEIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbInBhdGgiXQp9Cg==
