import dev from "$fresh/dev.ts";

// Start the development server with proper URL format
await dev(import.meta.url, "./main.ts");