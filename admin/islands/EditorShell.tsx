// islands/EditorShell.tsx  – tiny wrapper
import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts"; // Import IS_BROWSER

// Props should match the props expected by Editor.tsx
interface EditorShellProps {
  initial?: string;
  onChange?: (html: string) => void;
}

export default function EditorShell(props: EditorShellProps) {
  // Use 'any' for the component type initially, or define a proper type if needed
  const [ClientComponent, setClientComponent] = useState<any>(null);

  useEffect(() => {
    // Explicitly check IS_BROWSER before importing
    if (IS_BROWSER) {
      import("./Editor.tsx")
        .then((module) => {
          setClientComponent(() => module.default);
        })
        .catch(err => console.error("Error importing Editor component:", err));
    }
  }, []); // Empty dependency array ensures this runs only once on mount (client-side)

  // Render a placeholder during SSR or before client-side import finishes
  if (!IS_BROWSER || !ClientComponent) {
    // Added !IS_BROWSER check here as well for clarity during SSR
    // Render a placeholder while the actual editor component is loading
    // Added some basic styling matching the editor's min-height and border/padding
    return (
      <div class="min-h-[250px] p-4 border border-gray-300 rounded-lg bg-gray-50 animate-pulse flex items-center justify-center text-gray-400">
        Loading Editor...
      </div>
    );
  }
  // Removed duplicate if (!ClientComponent) block

  // Render the dynamically imported Editor component with the passed props
  return <ClientComponent {...props} />;
}