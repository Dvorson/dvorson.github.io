import { h } from "preact";
import { useState } from "preact/hooks";
import EditorShell from "./EditorShell.tsx"; // Import the shell component

// Modern Tailwind design for the admin form
export default function AdminForm() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle saving a draft
  function handleSaveDraft(e) {
    e.preventDefault();
    console.log("Save Draft button clicked!");
    setStatus("");
    setIsLoading(true);
    
    try {
      fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          tags: tags ? tags.split(",") : [],
          category,
          slug,
          content
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error("Server returned " + response.status);
        }
        return response.json();
      })
      .then(data => {
        console.log("Draft saved successfully:", data);
        setStatus(data.message || "Draft saved successfully!");
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Network error:", error);
        setStatus("Error: " + error.message);
        setIsLoading(false);
      });
    } catch (error) {
      console.error("Error saving draft:", error);
      setStatus("Error: " + error.message);
      setIsLoading(false);
    }
  }

  // Handle publishing a post
  function handlePublish(e) {
    e.preventDefault();
    console.log("Publish button clicked!");
    setStatus("");
    setIsLoading(true);
    
    try {
      fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          tags: tags ? tags.split(",") : [],
          category,
          slug,
          content
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error("Server returned " + response.status);
        }
        return response.json();
      })
      .then(data => {
        console.log("Post published successfully:", data);
        setStatus(data.message || "Post published successfully!");
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Network error:", error);
        setStatus("Error: " + error.message);
        setIsLoading(false);
      });
    } catch (error) {
      console.error("Error publishing post:", error);
      setStatus("Error: " + error.message);
      setIsLoading(false);
    }
  }

  return (
    <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 max-w-4xl mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Title Field */}
        <div class="col-span-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input 
            type="text" 
            placeholder="Enter post title" 
            value={title} 
            onInput={(e) => setTitle(e.currentTarget.value)} 
            class="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
          />
        </div>
        
        {/* Slug Field */}
        <div class="col-span-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Slug
          </label>
          <input 
            type="text" 
            placeholder="post-url-slug" 
            value={slug} 
            onInput={(e) => setSlug(e.currentTarget.value)} 
            class="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
          />
        </div>
        
        {/* Tags Field */}
        <div class="col-span-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <input 
            type="text" 
            placeholder="tag1, tag2, tag3" 
            value={tags} 
            onInput={(e) => setTags(e.currentTarget.value)} 
            class="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
          />
        </div>
        
        {/* Category Field */}
        <div class="col-span-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <input 
            type="text" 
            placeholder="Enter category" 
            value={category} 
            onInput={(e) => setCategory(e.currentTarget.value)} 
            class="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
          />
        </div>
      </div>
      
      {/* Content Field */}
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Content
        </label>
        <div class="border border-gray-300 rounded-lg overflow-hidden min-h-[250px]"> {/* Added min-h here too */}
          <EditorShell initial={content} onChange={setContent} /> {/* Use the shell */}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div class="flex flex-col sm:flex-row justify-end items-center gap-3">
        <button 
          type="button"
          onClick={handleSaveDraft}
          disabled={isLoading}
          id="save-draft-btn"
          class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Save Draft"}
        </button>
        
        <button 
          type="button"
          onClick={handlePublish}
          disabled={isLoading}
          id="publish-btn"
          class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50"
        >
          {isLoading ? "Publishing..." : "Publish"}
        </button>
      </div>
      
      {/* Status Message */}
      {status && (
        <div class={`mt-6 p-4 rounded-lg ${status.includes("Error") ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"}`}>
          <p>
            {status}
          </p>
        </div>
      )}
    </div>
  );
}