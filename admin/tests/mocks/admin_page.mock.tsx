import { h } from "preact";

// Simple mock implementation of AdminPage with no hooks
export function MockAdminPage() {
  // Improved mock API handlers for testing that properly use form data
  const saveDraft = (e: MouseEvent) => {
    e.preventDefault();
    
    // Get values from form inputs
    const form = (e.target as HTMLButtonElement).closest("div.p-4") as HTMLDivElement;
    const inputs = form.querySelectorAll("input");
    const title = inputs[0].value || "Test Title";
    const slug = inputs[1].value || "test-slug";
    const tags = inputs[2].value ? inputs[2].value.split(",") : ["test", "tags"];
    const category = inputs[3].value || "Test Category";
    const content = "<p>Test content</p>";
    
    // Actually make the fetch call
    fetch("/api/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, tags, category, slug, content })
    });
  };

  const publish = (e: MouseEvent) => {
    e.preventDefault();
    
    // Get values from form inputs
    const form = (e.target as HTMLButtonElement).closest("div.p-4") as HTMLDivElement;
    const inputs = form.querySelectorAll("input");
    const title = inputs[0].value || "Test Title";
    const slug = inputs[1].value || "test-slug";
    const tags = inputs[2].value ? inputs[2].value.split(",") : ["test", "tags"];
    const category = inputs[3].value || "Test Category";
    const content = "<p>Test content</p>";
    
    // Actually make the fetch call
    fetch("/api/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, tags, category, slug, content })
    });
  };

  // Render a simple version of the form
  return (
    <div class="p-4">
      <h1 class="text-2xl mb-4">Blog Post Admin</h1>
      <input type="text" placeholder="Title" class="border p-2 w-full mb-2" />
      <input type="text" placeholder="Slug" class="border p-2 w-full mb-2" />
      <input type="text" placeholder="Tags (comma-separated)" class="border p-2 w-full mb-2" />
      <input type="text" placeholder="Category" class="border p-2 w-full mb-4" />
      <div class="border p-4 min-h-[200px]" data-testid="mock-editor"></div>
      <div class="mt-4 space-x-2">
        <button onClick={saveDraft} class="px-4 py-2 bg-gray-200 rounded">Save Draft</button>
        <button onClick={publish} class="px-4 py-2 bg-blue-600 text-white rounded">Publish</button>
      </div>
    </div>
  );
}

export default MockAdminPage;