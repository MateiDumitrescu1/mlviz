import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
	plugins: [react()],
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
