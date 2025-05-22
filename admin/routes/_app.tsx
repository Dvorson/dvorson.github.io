import { h } from "preact";
import { AppProps } from "$fresh/server.ts";

export default function App({ Component }: AppProps) {
  return (
    <html lang="en" class="scroll-smooth">
      <head>
        <meta charset="utf-f-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Blog Admin - Anto Dvorson</title>
        <link rel="stylesheet" href="/style.css" /> {/* This should contain Tailwind directives or be processed by Fresh/Tailwind */}
      </head>
      
      <body class="bg-gray-50 text-gray-900 font-sans antialiased flex flex-col min-h-screen">
        {/* Header */}
        <header class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div class="max-w-5xl mx-auto px-4 sm:px-6 flex justify-between items-center h-16">
            <a href="/admin" class="text-2xl font-bold text-gradient">Anto Dvorson</a> {/* Assuming text-gradient is available via style.css */}
            <nav>
              <a href="/" target="_blank" rel="noopener noreferrer" class="text-sm text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md transition-colors duration-200">View Site</a>
            </nav>
          </div>
        </header>
        
        {/* Main Content */}
        <main class="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <Component />
        </main>
        
        {/* Footer */}
        <footer class="bg-white border-t border-gray-200 py-6">
          <div class="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <p class="text-sm text-gray-500">© {new Date().getFullYear()} Anto Dvorson. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}