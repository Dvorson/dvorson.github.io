'use client'

import { useState, useRef } from 'react'
import { Upload, Image as ImageIcon, X } from 'lucide-react'

interface ImageUploadProps {
  onImageUpload: (src: string, alt: string) => void
}

export default function ImageUpload({ onImageUpload }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Only image files are supported')
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressSteps = [25, 50, 75, 100]
      for (const step of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 200))
        setUploadProgress(step)
      }

      // Create blob URL for the image
      const url = URL.createObjectURL(file)
      onImageUpload(url, file.name)
      
      setIsUploading(false)
      setUploadProgress(0)
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload image')
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
    // Reset input
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="sr-only"
        data-testid="image-file-input"
      />

      {/* Upload Area (shown when triggered via slash command) */}
      <div
        className={`hidden border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        } ${isUploading ? 'pointer-events-none' : 'cursor-pointer'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        data-testid="image-upload-area"
      >
        {isUploading ? (
          <div className="space-y-4">
            <div className="text-gray-600">Uploading... {uploadProgress}%</div>
            <div className="upload-progress mx-auto max-w-xs">
              <div 
                className="upload-progress-bar" 
                style={{ width: `${uploadProgress}%` }}
                data-testid="upload-progress"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 text-gray-400">
              {dragActive ? (
                <Upload className="w-full h-full" />
              ) : (
                <ImageIcon className="w-full h-full" />
              )}
            </div>
            <div className="text-gray-600">
              {dragActive ? (
                'Drop image here'
              ) : (
                <>
                  <div className="font-medium">Drag and drop an image or</div>
                  <div className="text-blue-600 font-medium hover:text-blue-800">
                    click to browse
                  </div>
                </>
              )}
            </div>
            <div className="text-sm text-gray-400">
              PNG, JPG, GIF up to 10MB
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      <div className="hidden" data-testid="upload-error">
        Only image files are supported
      </div>
    </>
  )
}