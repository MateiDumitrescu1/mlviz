import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
// TODO these configs were written to try to fix a webworker module error, but it did nothing, so now they have to
// TODO be removed to avoid side effects
export default defineConfig({
	plugins: [react(), tailwindcss()],
	base: "./",
	build: {
		target: "esnext", // ✅ Enables top-level await
		rollupOptions: {
			output: {
				format: "es",
			},
		},
	},
});
