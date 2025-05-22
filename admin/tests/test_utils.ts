import { Window } from "happy-dom";
import { render as preactRender } from "preact-testing-library";
import { h, VNode, Component } from "preact";

// Create a DOM environment with happy-dom
const window = new Window();
const document = window.document;

// Set up global variables that Fresh and our components expect
globalThis.window = window as any;
globalThis.document = document as any;
globalThis.navigator = window.navigator as any;
globalThis.HTMLElement = window.HTMLElement as any;
globalThis.Element = window.Element as any;
globalThis.Node = window.Node as any;
(globalThis as any).IS_BROWSER = true;

// Storage for tracking fetch calls
const fetchCalls: Array<{url: string; options: any}> = [];

// Mock fetch for API endpoint tests
globalThis.fetch = (url: string | URL | Request, options?: RequestInit) => {
  // Track calls to fetch for assertions
  let urlStr = typeof url === 'string' ? url : url instanceof URL ? url.toString() : url.url;
  fetchCalls.push({ url: urlStr, options: options || {} });
  
  return Promise.resolve({
    json: () => Promise.resolve({ message: "Success" }),
    text: () => Promise.resolve("Success"),
    ok: true,
    status: 200,
  } as Response);
};

// Helper function to reset fetch call tracking
export function resetFetchCalls() {
  fetchCalls.length = 0;
}

// Helper function to get tracked fetch calls
export function getFetchCalls() {
  return [...fetchCalls];
}

// Utility to render Preact components for testing
export function render<P = any>(vnode: VNode<P>) {
  return preactRender(vnode as any);
}

// Mock for the TipTap editor
class MockTipTapEditor {
  constructor(config: any) {
    this.config = config;
    this.element = config.element;
    if (config.onUpdate && typeof config.onUpdate === 'function') {
      // Simulate an update event
      setTimeout(() => {
        config.onUpdate({ editor: this });
      }, 10);
    }
  }
  
  element: HTMLElement;
  config: any;
  
  getHTML() {
    return "<p>Updated content</p>";
  }
  
  destroy() {}
}

// Mock for Preact hooks
function mockPreactHooks() {
  // Create a hooks context object - this is crucial for Preact hooks to work
  const currentComponent: {
    _hooks: any[]; // Explicitly allow any type to be stored in hooks
    _nextHook: number;
  } = {
    _hooks: [],
    _nextHook: 0
  };
  const hooksContext = {
    __: [], // Array of hook states
    __H: {
      current: currentComponent
    }
  };

  // Mock the useState hook
  const useState = <T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void] => {
    const hookId = currentComponent._nextHook++;
    
    // Initialize hook state if it hasn't been set yet
    if (currentComponent._hooks.length <= hookId) {
      const state = typeof initialState === 'function' ? (initialState as Function)() : initialState;
      currentComponent._hooks.push(state);
    }
    
    const state = currentComponent._hooks[hookId];
    const setState = (_: any) => {}; // No-op setState function for tests
    
    return [state, setState];
  };
  
  // Mock useEffect - this should be a no-op in tests
  const useEffect = (effect: () => void | (() => void), deps?: any[]) => {
    // Track that this hook was called
    currentComponent._nextHook++;
    // Don't actually run effects in tests
  };
  
  // Mock useRef
  const useRef = <T>(initialValue: T | null) => {
    const hookId = currentComponent._nextHook++;
    
    // Initialize hook state if it hasn't been set yet
    if (currentComponent._hooks.length <= hookId) {
      currentComponent._hooks.push({ current: initialValue });
    }
    
    return currentComponent._hooks[hookId];
  };

  // Mock useCallback
  const useCallback = <T extends Function>(callback: T, deps: any[]) => {
    currentComponent._nextHook++; // Track hook call
    return callback;
  };
  
  // Mock useMemo
  const useMemo = <T>(factory: () => T, deps: any[]) => {
    const hookId = currentComponent._nextHook++;
    
    // Initialize hook state if it hasn't been set yet
    if (currentComponent._hooks.length <= hookId) {
      currentComponent._hooks.push(factory());
    }
    
    return currentComponent._hooks[hookId];
  };

  // Create a hooks module to be used when components import from 'preact/hooks'
  const hooksModule = {
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
    __h: hooksContext.__,
    __H: hooksContext.__H
  };
  
  // Assign to the global preact/hooks module locations
  (globalThis as any).preactHooks = hooksModule;
  (globalThis as any).__preactHooks = true;
  
  // Override the real preact/hooks module
  const originalImport = (globalThis as any).import;
  (globalThis as any).import = async (specifier: string, ...args: any[]) => {
    if (specifier === 'preact/hooks') {
      return hooksModule;
    }
    return originalImport(specifier, ...args);
  };
}

// Setup React mock for TipTap editor testing
export function setupEditorTestEnv() {
  // Set up Preact hooks mock first
  mockPreactHooks();

  // Get the hooks module we just created
  const preactHooksModule = (globalThis as any).preactHooks;

  // Create React compatibility layer needed for TipTap
  const reactModule = {
    createElement: (type: any, props: any, ...children: any[]) => {
      return { type, props, children } as any;
    },
    Fragment: Symbol('Fragment') as any,
    createFactory: () => ({}),
    cloneElement: () => ({}),
    createContext: () => ({}),
    isValidElement: () => true,
  };

  // Set up React global for components that expect it
  (globalThis as any).React = reactModule;
  
  // Mock preact/hooks module
  const originalRequire = (globalThis as any).require;
  (globalThis as any).require = (moduleName: string) => {
    if (moduleName === 'preact/hooks') {
      return preactHooksModule;
    }
    if (moduleName === 'preact/compat') {
      return reactModule;
    }
    return originalRequire ? originalRequire(moduleName) : undefined;
  };
  
  // Create a mock for the dynamic import function
  const originalImport = (globalThis as any).import;
  
  // Override the import function for all the modules we need to mock
  (globalThis as any).import = async (url: string, ...args: any[]) => {
    // Handle Preact hooks
    if (url === 'preact/hooks') {
      return preactHooksModule;
    }
    
    // Handle React compatibility layer
    if (url === 'preact/compat') {
      return reactModule;
    }
    
    // Handle TipTap modules
    if (url.includes("@tiptap/core")) {
      return { Editor: MockTipTapEditor };
    }
    if (url.includes("@tiptap")) {
      return { default: {} };
    }
    
    // Fallback to the original import for other modules
    return originalImport(url, ...args);
  };
  
  // Setup MutationObserver mock - critical for TipTap
  // @ts-ignore - Mock MutationObserver
  window.MutationObserver = class MutationObserver {
    constructor(callback: Function) {
      this.callback = callback;
    }
    callback: Function;
    observe() {
      // Immediately trigger callback with empty mutation records
      setTimeout(() => {
        this.callback([], this);
      }, 0);
    }
    disconnect() {}
    takeRecords() { return []; }
  };
}

// Add mock spy implementation
export namespace spy {
  export type Spy<T extends Function> = T & {
    calls: { args: any[] }[];
  };
}

export function spy<T = any, A extends any[] = any[], R = undefined>(): spy.Spy<(...args: A) => R> {
  const calls: { args: A }[] = [];
  
  const fn = (...args: A): R => {
    calls.push({ args });
    return undefined as unknown as R;
  };
  
  (fn as spy.Spy<(...args: A) => R>).calls = calls;
  
  return fn as spy.Spy<(...args: A) => R>;
}

// Cleanup mocks after tests
export function cleanupMocks() {
  resetFetchCalls();
  // Use assignment instead of delete operator since the property may not be optional
  (globalThis as any).React = undefined;
  
  // Reset the DOM
  document.body.innerHTML = '';
}