import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";



// Proxies /api requests to the Express server during `npm run dev`,
// so the frontend can just call fetch("/api/...") with no CORS setup needed.
export default defineConfig({
    plugins: [react()],
    server: {
	host: true,
	allowedHosts: ['mrsmcmac','mrsmcmac.q.local'],
	port: 5173,
	proxy: {
	    "/api": {
		target: "http://localhost:3001",
		changeOrigin: true,
		rewrite: (path) => path.replace(/^\/api/, '')
	    },
	},
    },
});
