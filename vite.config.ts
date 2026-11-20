import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
// Relative assets let the same build run at a domain root or under a Pages repository path.
export default defineConfig({ base: "./", plugins: [vue()] });
