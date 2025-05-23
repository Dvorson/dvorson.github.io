'use client'

import { useState } from 'react'
import NotionEditor from '@/components/NotionEditor'
import PostForm from '@/components/PostForm'
import { PostData } from '@/types'

export default function AdminPage() {
  const [postData, setPostData] = useState<PostData>({
    title: '',
    content: '',
    tags: [],
    category: '',
    slug: ''
  })

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleContentChange = (content: string) => {
    setPostData(prev => ({ ...prev, content }))
  }

  const handleSaveDraft = async () => {
    if (!postData.title || !postData.content) {
      setMessage({ type: 'error', text: 'Title and content are required' })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Draft saved successfully!' })
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save draft' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePublish = async () => {
    if (!postData.title || !postData.content || !postData.category) {
      setMessage({ type: 'error', text: 'Title, content, and category are required' })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Post published successfully!' })
        // Clear form after successful publish
        setPostData({
          title: '',
          content: '',
          tags: [],
          category: '',
          slug: ''
        })
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to publish post' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Blog Admin
          </h1>
          <p className="text-gray-600">
            Create and manage your blog posts with a Notion-style editor
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div 
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
            data-testid={`${message.type}-message`}
          >
            {message.text}
          </div>
        )}

        {/* Post Form */}
        <PostForm
          postData={postData}
          onChange={setPostData}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
          isLoading={isLoading}
        />

        {/* Editor */}
        <div className="mt-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Content
          </label>
          <div className="border border-gray-200 rounded-lg bg-white">
            <NotionEditor
              initialContent={postData.content}
              onChange={handleContentChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}