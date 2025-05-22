import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";
import tailwind from "$fresh/plugins/tailwind.ts"; // As per new instructions
import tailwindConfig from "./tailwind.config.ts";

// Fresh's `start()` returns a Promise that only settles when the HTTP server
// closes.  Using `await` here blocks Deno’s file-watcher, which expects the
// main module to finish evaluating quickly.  We therefore **call without
// awaiting** so the dev process stays alive while still allowing `deno task
// dev --watch` to restart on code changes.

start(manifest, {
  plugins: [
    tailwind(tailwindConfig) // Initialize with your tailwind.config.ts
  ],
  server: {
    port: 8000
  }
});