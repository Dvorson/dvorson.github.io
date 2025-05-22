// Type declarations for Fresh framework and Deno modules

declare module "$fresh/server.ts" {
  // Handler interface for route handlers
  export interface Handlers {
    GET?: (req: Request, ctx: any) => Response | Promise<Response>;
    POST?: (req: Request, ctx: any) => Response | Promise<Response>;
    PUT?: (req: Request, ctx: any) => Response | Promise<Response>;
    DELETE?: (req: Request, ctx: any) => Response | Promise<Response>;
    PATCH?: (req: Request, ctx: any) => Response | Promise<Response>;
    HEAD?: (req: Request, ctx: any) => Response | Promise<Response>;
    OPTIONS?: (req: Request, ctx: any) => Response | Promise<Response>;
  }

  // Server startup function with manifest
  export function start(manifest: unknown, options?: unknown): Promise<void>;
  
  // App component props
  export interface AppProps {
    Component: any;
    url: URL;
    route: string;
    params: Record<string, string>;
    data: any;
  }
}

// Make Deno a proper global object for TypeScript
declare global {
  // Declare Deno namespace as a variable to fix 'cannot use namespace as a value' errors
  const Deno: {
    test: {
      (name: string, fn: () => void | Promise<void>): void;
      (options: { name: string; fn: () => void | Promise<void>; [key: string]: any }): void;
    };
    mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
    writeTextFile(path: string, data: string): Promise<void>;
    readTextFile(path: string): Promise<string>;
    run(options: { cmd: string[] }): {
      status(): Promise<{ success: boolean }>;
    };
    env: {
      get(key: string): string | undefined;
    };
  };

  // Test environment globals
  interface Window {
    MutationObserver: any;
    React: any;
  }

  // Add index signature to globalThis for test utilities
  interface globalThis {
    [key: string]: any;
    window: Window & typeof globalThis;
    document: Document;
    navigator: Navigator;
    HTMLElement: typeof HTMLElement;
    Element: typeof Element;
    Node: typeof Node;
    IS_BROWSER: boolean;
    React: {
      createElement: any;
      Fragment: any;
    };
  }
}

// Explicitly export empty to make it a module
export {};