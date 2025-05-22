import { h } from "preact";
import AdminForm from "../islands/AdminForm.tsx";

// The main admin page with modern design
export default function AdminPage() {
  return (
    <div class="py-8 px-4 sm:px-6">
      <div class="max-w-4xl mx-auto">
        {/* Header */}
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-indigo-600 mb-2">
            Blog Admin
          </h1>
          <p class="text-gray-600 max-w-2xl mx-auto">
            Create and manage your blog posts with this intuitive interface.
          </p>
        </div>
        
        {/* Main Form */}
        <AdminForm />
      </div>
    </div>
  );
}