import { h } from "preact";
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useState, useCallback } from "preact/hooks";

// Basic Node View Component for Uploadable Image
export default function ImageUploadNodeView(props: NodeViewProps) {
  const { node, updateAttributes, editor } = props;
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Placeholder for actual upload logic
  const uploadFile = useCallback(async (file: File) => {
    if (!file || !editor.isEditable) return;

    // --- Start Placeholder Upload Logic ---
    console.log("Simulating upload for:", file.name);
    setUploadProgress(0); 
    // Simulate upload progress
    await new Promise(resolve => setTimeout(resolve, 500)); setUploadProgress(25);
    await new Promise(resolve => setTimeout(resolve, 500)); setUploadProgress(50);
    await new Promise(resolve => setTimeout(resolve, 500)); setUploadProgress(75);
    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    // Simulate successful upload - replace with actual API call
    // The API should return the final URL of the uploaded image
    const uploadedUrl = `/uploads/${file.name}`; // Example URL
    console.log("Simulated upload complete. URL:", uploadedUrl);
    
    updateAttributes({ 
      src: uploadedUrl, 
      isUploading: false, // Mark as no longer uploading
      alt: file.name // Set alt text from filename
    });
    setUploadProgress(null); // Clear progress
    // --- End Placeholder Upload Logic ---

    /* 
    // --- Actual Upload Logic (Example) ---
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('image', file);

    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/upload', { 
        method: 'POST',
        body: formData,
        // Add progress tracking if your API/fetch supports it
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json(); // Assuming API returns { url: '...' }
      
      if (result.url) {
        updateAttributes({ 
          src: result.url, 
          isUploading: false,
          alt: file.name 
        });
      } else {
         throw new Error('API did not return a URL');
      }
    } catch (error) {
      console.error("Upload error:", error);
      // Handle error state in UI, maybe remove the node or show error message
      // editor.commands.deleteRange(props.getPos()); // Example: delete node on error
    } finally {
      setUploadProgress(null);
    }
    // --- End Actual Upload Logic ---
    */

  }, [editor, updateAttributes]);

  const handleFileChange = (event: h.JSX.TargetedEvent<HTMLInputElement, Event>) => {
    const file = event.currentTarget.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDrop = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const file = event.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      uploadFile(file);
    }
  }, [uploadFile]);

  const handleDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  // Render the upload UI or the actual image
  return (
    <NodeViewWrapper 
      className={`relative group ${node.attrs.isUploading ? 'border-2 border-dashed border-gray-300 rounded-lg p-4 text-center' : ''} ${isDragging ? 'border-indigo-500 bg-indigo-50' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      as="div" // Render as a div instead of span for block behavior
    >
      {node.attrs.isUploading ? (
        <div class="flex flex-col items-center justify-center h-32">
          {uploadProgress !== null ? (
            <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div class="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
              <p class="text-sm text-gray-500 mt-2">Uploading... {uploadProgress}%</p>
            </div>
          ) : (
            <>
              <svg class="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              <p class="text-sm text-gray-500 mb-1">
                {isDragging ? 'Drop image here' : 'Drag and drop or'}
              </p>
              <label class="cursor-pointer text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                Upload an image
                <input type="file" accept="image/*" class="sr-only" onChange={handleFileChange} />
              </label>
            </>
          )}
        </div>
      ) : (
        // Render the actual image once uploaded
        // Added object-contain to prevent stretching
        <img 
          src={node.attrs.src} 
          alt={node.attrs.alt} 
          title={node.attrs.title}
          className="block max-w-full h-auto object-contain" 
        />
      )}
    </NodeViewWrapper>
  );
}