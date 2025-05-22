// deno_mock.ts - Utilities for mocking Deno APIs in tests
import { vi } from "vitest";

// Utility to mock Deno.spawn 
export function mockDenoSpawn() {
  const originalSpawn = Deno.spawn;
  
  // Mock implementation returning a process-like object
  Deno.spawn = vi.fn(() => {
    return Promise.resolve({
      status: { success: true, code: 0 },
      stdout: new TextEncoder().encode("Success"),
      stderr: new TextEncoder().encode(""),
      kill: () => {},
      close: () => {}
    });
  }) as typeof Deno.spawn;
  
  // Function to restore the original
  return function restore() {
    Deno.spawn = originalSpawn;
  };
}

// Utility to mock Deno.writeTextFile
export function mockDenoWriteTextFile() {
  const originalWriteTextFile = Deno.writeTextFile;
  
  // Mock implementation
  Deno.writeTextFile = vi.fn(async () => {}) as typeof Deno.writeTextFile;
  
  // Function to restore the original
  return function restore() {
    Deno.writeTextFile = originalWriteTextFile;
  };
}