'use client'

import { PostData } from '@/types'

interface PostFormProps {
  postData: PostData
  onChange: (data: PostData) => void
  onSaveDraft: () => void
  onPublish: () => void
  isLoading: boolean
}

export default function PostForm({
  postData,
  onChange,
  onSaveDraft,
  onPublish,
  isLoading
}: PostFormProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...postData, title: e.target.value })
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...postData, category: e.target.value })
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...postData, slug: e.target.value })
  }

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
    onChange({ ...postData, tags })
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Title *
        </label>
        <input
          type="text"
          id="title"
          value={postData.title}
          onChange={handleTitleChange}
          placeholder="Enter post title..."
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          data-testid="post-title"
        />
      </div>

      {/* Category and Slug Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <input
            type="text"
            id="category"
            value={postData.category}
            onChange={handleCategoryChange}
            placeholder="e.g., Development, Design..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            data-testid="post-category"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
            Slug (optional)
          </label>
          <input
            type="text"
            id="slug"
            value={postData.slug}
            onChange={handleSlugChange}
            placeholder="custom-url-slug"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            data-testid="post-slug"
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <input
          type="text"
          id="tags"
          value={postData.tags.join(', ')}
          onChange={handleTagsChange}
          placeholder="tag1, tag2, tag3..."
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          data-testid="post-tags"
        />
        <p className="text-sm text-gray-500 mt-1">
          Separate tags with commas
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onSaveDraft}
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          data-testid="save-draft-button"
        >
          {isLoading ? 'Saving...' : 'Save Draft'}
        </button>

        <button
          onClick={onPublish}
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          data-testid="publish-button"
        >
          {isLoading ? 'Publishing...' : 'Publish Post'}
        </button>
      </div>
    </div>
  )
}