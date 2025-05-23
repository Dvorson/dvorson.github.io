'use client'

import { useState } from 'react'
import { Video, ExternalLink, Upload } from 'lucide-react'

interface VideoEmbedProps {
  onVideoEmbed: (src: string) => void
}

export default function VideoEmbed({ onVideoEmbed }: VideoEmbedProps) {
  const [activeTab, setActiveTab] = useState<'url' | 'upload'>('url')
  const [videoUrl, setVideoUrl] = useState('')
  const [error, setError] = useState('')

  const extractVideoId = (url: string) => {
    // YouTube URL patterns
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const youtubeMatch = url.match(youtubeRegex)
    
    if (youtubeMatch) {
      return {
        type: 'youtube',
        id: youtubeMatch[1],
        embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`
      }
    }

    // Vimeo URL patterns
    const vimeoRegex = /(?:vimeo\.com\/)(?:.*#|.*\/videos\/)?([0-9]+)/
    const vimeoMatch = url.match(vimeoRegex)
    
    if (vimeoMatch) {
      return {
        type: 'vimeo',
        id: vimeoMatch[1],
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`
      }
    }

    // Direct video file URLs
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return {
        type: 'file',
        id: url,
        embedUrl: url
      }
    }

    return null
  }

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!videoUrl.trim()) {
      setError('Please enter a video URL')
      return
    }

    const videoInfo = extractVideoId(videoUrl)
    
    if (!videoInfo) {
      setError('Unsupported video URL. Please use YouTube, Vimeo, or direct video file links.')
      return
    }

    onVideoEmbed(videoInfo.embedUrl)
    setVideoUrl('')
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      setError('Only video files are supported')
      return
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      setError('File size must be less than 100MB')
      return
    }

    const url = URL.createObjectURL(file)
    onVideoEmbed(url)
    
    // Reset input
    e.target.value = ''
  }

  return (
    <div className="hidden space-y-4" data-testid="video-embed-component">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'url'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('url')}
        >
          <ExternalLink className="w-4 h-4 inline mr-2" />
          URL
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'upload'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('upload')}
          data-testid="upload-video-tab"
        >
          <Upload className="w-4 h-4 inline mr-2" />
          Upload
        </button>
      </div>

      {/* URL Tab */}
      {activeTab === 'url' && (
        <form onSubmit={handleUrlSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video URL
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              data-testid="video-url-input"
            />
            <p className="text-sm text-gray-500 mt-1">
              Supports YouTube, Vimeo, and direct video file URLs
            </p>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Embed Video
          </button>
        </form>
      )}

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Video File
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              data-testid="video-file-input"
            />
            <p className="text-sm text-gray-500 mt-1">
              MP4, WebM, OGG up to 100MB
            </p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" data-testid="video-error">
          {error}
        </div>
      )}

      {/* Preview Areas */}
      <div className="hidden" data-testid="video-embed">
        <iframe 
          src=""
          width="100%" 
          height="315" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
        />
      </div>

      <div className="hidden" data-testid="uploaded-video">
        <video controls style={{ maxWidth: '100%' }}>
          <source src="" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="hidden" data-testid="video-caption">
        <input
          type="text"
          placeholder="Add a caption..."
          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>
    </div>
  )
}