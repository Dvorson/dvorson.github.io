import { h } from "preact";

// Simple mock implementation of the Editor component that doesn't use hooks
export function MockEditor({ data, onChange }: { data: string; onChange?: (d: string) => void }) {
  // Create a function to simulate content change
  const simulateChange = () => {
    if (typeof onChange === 'function') {
      onChange("<p>Updated content</p>");
    }
  };
  
  // For testing purposes, we'll simulate an update after render
  // This will happen in the test, not automatically

  // Return a simple div with data attribute to verify render
  return (
    <div
      class="border p-4 min-h-[200px]"
      data-testid="mock-editor"
      data-content={data}
      onClick={simulateChange}
    />
  );
}

export default MockEditor;