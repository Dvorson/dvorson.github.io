import { h } from "preact";
import { useEffect, useState, useRef } from "preact/hooks";

// Basic structure for the command list popup
// Styling and actual command execution logic will be added later
export default function CommandList({ items, command }: { items: any[], command: (item: any) => void }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        setSelectedIndex((selectedIndex + items.length - 1) % items.length);
        return true;
      }
      if (e.key === "ArrowDown") {
        setSelectedIndex((selectedIndex + 1) % items.length);
        return true;
      }
      if (e.key === "Enter") {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    };

    // This component needs to capture keydown events when it's active
    // We might need a more robust way to handle this depending on how
    // the suggestion utility passes control.
    // For now, adding a listener to the component itself.
    const component = componentRef.current;
    component?.addEventListener('keydown', onKeyDown);

    return () => {
      component?.removeEventListener('keydown', onKeyDown);
    };
  }, [items, selectedIndex]);

  const selectItem = (index: number) => {
    const item = items[index];
    console.log("[CommandList] selectItem called with index:", index, "item:", item); // Log item selection
    if (item) {
      console.log("[CommandList] Executing command for:", item.title); // Log before executing
      command(item);
    } else {
      console.log("[CommandList] No item found at index:", index);
    }
  };

  // Basic rendering - needs proper styling
  return (
    <div 
      ref={componentRef} 
      class="bg-white rounded-lg shadow-lg border border-gray-200 p-2 text-sm"
      style={{ minWidth: '200px' }} // Example inline style
      tabIndex={-1} // Make it focusable for keydown events
    >
      {items.length ? (
        items.map((item, index) => (
          <button
            key={item.title}
            class={`block w-full text-left px-3 py-1.5 rounded ${
              index === selectedIndex ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'
            }`}
            onClick={(e) => {
              console.log("[CommandList] Button clicked:", item.title); // Log button click
              e.preventDefault(); // Prevent any default button behavior
              selectItem(index);
            }}
          >
            {item.title} {/* Assuming items have a 'title' property */}
          </button>
        ))
      ) : (
        <div class="p-2 text-gray-500">No commands found</div>
      )}
    </div>
  );
}