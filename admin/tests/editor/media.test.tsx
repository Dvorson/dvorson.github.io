import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from '@jest/globals'
import NotionEditor from '../../src/components/NotionEditor'

describe('Images and Videos', () => {
  let mockOnChange: jest.Mock
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    mockOnChange = jest.fn()
    user = userEvent.setup()
    
    // Mock URL.createObjectURL
    global.URL.createObjectURL = jest.fn(() => 'mock-blob-url')
    global.URL.revokeObjectURL = jest.fn()
  })

  describe('Image Upload', () => {
    it('should upload images via drag and drop', async () => {
      render(<NotionEditor onChange={mockOnChange} />)
      
      const editor = screen.getByTestId('notion-editor')
      const imageFile = new File(['fake-image'], 'test.jpg', { type: 'image/jpeg' })
      
      fireEvent.dragOver(editor)
      fireEvent.drop(editor, {
        dataTransfer: {
          files: [imageFile],
          types: ['Files']
        }
      })
      
      await waitFor(() => {
        const uploadedImage = screen.getByTestId('uploaded-image')
        expect(uploadedImage).toBeInTheDocument()
        expect(uploadedImage).toHaveAttribute('src', 'mock-blob-url')
        expect(uploadedImage).toHaveAttribute('alt', 'test.jpg')
      })
    })

    it('should upload images via file input', async () => {
      render(<NotionEditor onChange={mockOnChange} />)
      
      const editor = screen.getByTestId('notion-editor')
      await user.type(editor, '/image')
      
      await waitFor(() => {
        expect(screen.getByText('Image')).toBeInTheDocument()
      })
      
      await user.click(screen.getByText('Image'))
      
      const fileInput = screen.getByTestId('image-file-input')
      const imageFile = new File(['fake-image'], 'upload.png', { type: 'image/png' })
      
      await user.upload(fileInput, imageFile)
      
      await waitFor(() => {
        const uploadedImage = screen.getByTestId('uploaded-image')
        expect(uploadedImage).toBeInTheDocument()
        expect(uploadedImage).toHaveAttribute('alt', 'upload.png')
      })
    })

    it('should show upload progress', async () => {
      render(<NotionEditor onChange={mockOnChange} />)
      
      const editor = screen.getByTestId('notion-editor')
      await user.type(editor, '/image')
      await user.click(screen.getByText('Image'))
      
      const fileInput = screen.getByTestId('image-file-input')
      const largeImageFile = new File(['fake-large-image'], 'large.jpg', { type: 'image/jpeg' })
      
      await user.upload(fileInput, largeImageFile)
      
      await waitFor(() => {
        const progressBar = screen.getByTestId('upload-progress')
        expect(progressBar).toBeInTheDocument()
      })
    })

    it('should handle invalid file types gracefully', async () => {
      render(<NotionEditor onChange={mockOnChange} />)
      
      const editor = screen.getByTestId('notion-editor')
      const textFile = new File(['fake-text'], 'document.txt', { type: 'text/plain' })
      
      fireEvent.drop(editor, {
        dataTransfer: {
          files: [textFile],
          types: ['Files']
        }
      })
      
      await waitFor(() => {
        const errorMessage = screen.getByTestId('upload-error')
        expect(errorMessage).toHaveTextContent('Only image files are supported')
      })
    })

    it('should allow image caption editing', async () => {
      render(<NotionEditor onChange={mockOnChange} />)
      
      const editor = screen.getByTestId('notion-editor')
      await user.type(editor, '/image')
      await user.click(screen.getByText('Image'))
      
      const fileInput = screen.getByTestId('image-file-input')
      const imageFile = new File(['fake-image'], 'test.jpg', { type: 'image/jpeg' })
      await user.upload(fileInput, imageFile)
      
      await waitFor(() => {
        expect(screen.getByTestId('image-caption')).toBeInTheDocument()
      })
      
      await user.type(screen.getByTestId('image-caption'), 'This is a test image')
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.stringContaining('This is a test image')
        )
      })
    })

    it('should support image resizing', async () => {
      render(<NotionEditor onChange={mockOnChange} />)
      
      const editor = screen.getByTestId('notion-editor')
      await user.type(editor, '/image')
      await user.click(screen.getByText('Image'))
      
      const fileInput = screen.getByTestId('image-file-input')
      const imageFile = new File(['fake-image'], 'test.jpg', { type: 'image/jpeg' })
      await user.upload(fileInput, imageFile)
      
      await waitFor(() => {
        expect(screen.getByTestId('image-resize-handle')).toBeInTheDocument()
      })
      
      const resizeHandle = screen.getByTestId('image-resize-handle')
      fireEvent.mouseDown(resizeHandle, { clientX: 100, clientY: 100 })
      fireEvent.mouseMove(resizeHandle, { clientX: 150, clientY: 150 })
      fireEvent.mouseUp(resizeHandle)
      
      await waitFor(() => {
        const image = screen.getByTestId('uploaded-image')
        expect(image).toHaveStyle('width: 150px')
      })
    })

    it('should support image alignment options', async () => {
      render(<NotionEditor onChange={mockOnChange} />)
      
      const editor = screen.getByTestId('notion-editor')
      await user.type(editor, '/image')
      await user.click(screen.getByText('Image'))
      
      const fileInput = screen.getByTestId('image-file-input')
      const imageFile = new File(['fake-image'], 'test.jpg', { type: 'image/jpeg' })
      await user.upload(fileInput, imageFile)
      
      await waitFor(() => {
        expect(screen.getByTestId('align-center')).toBeInTheDocument()
      })
      
      await user.click(screen.getByTestId('align-center'))
      
      await waitFor(() => {
        const imageContainer = screen.getByTestId('image-container')
        expect(imageContainer).toHaveClass('text-center')
      })
    })
  })

  describe('Video Embed', () => {
    it('should embed YouTube videos via URL', async () => {
      render(<NotionEditor onChange={mockOnChange} />)
      
      const editor = screen.getByTestId('notion-editor')
      await user.type(editor, '/video')
      
      await waitFor(() => {
        expect(screen.getByText('Video')).toBeInTheDocument()
      })
      
      await user.click(screen.getByText('Video'))
      
      const urlInput = screen.getByTestId('video-url-input')
      await user.type(urlInput, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      await user.keyboard('{Enter}')
      
      await waitFor(() => {
        const videoEmbed = screen.getByTestId('video-embed')
        expect(videoEmbed).toBeInTheDocument()
        expect(videoEmbed).toHaveAttribute('src', expect.stringContaining('youtube.com/embed'))
      })
    })

    it('should embed Vimeo videos', async () => {
      render(<NotionEditor onChange={mockOnChange} />)
      
      const editor = screen.getByTestId('notion-editor')
      await user.type(editor, '/video')
      await user.click(screen.getByText('Video'))
      
      const urlInput = screen.getByTestId('video-url-input')
      await user.type(urlInput, 'https://vimeo.com/123456789')
      await user.keyboard('{Enter}')
      
      await waitFor(() => {
        const videoEmbed = screen.getByTestId('video-embed')
        expect(videoEmbed).toHaveAttribute('src', expect.stringContaining('player.vimeo.com'))
      })
    })

    it('should handle invalid video URLs', async () => {
      render(<NotionEditor onChange={mockOnChange} />)
      
      const editor = screen.getByTestId('notion-editor')
      await user.type(editor, '/video')
      await user.click(screen.getByText('Video'))
      
      const urlInput = screen.getByTestId('video-url-input')
      await user.type(urlInput, 'https://example.com/not-a-video')
      await user.keyboard('{Enter}')
      
      await waitFor(() => {
        const errorMessage = screen.getByTestId('video-error')
        expect(errorMessage).toHaveTextContent('Unsupported video URL')
      })
    })

    it('should support video captions', async () => {
      render(<NotionEditor onChange={mockOnChange} />)
      
      const editor = screen.getByTestId('notion-editor')
      await user.type(editor, '/video')
      await user.click(screen.getByText('Video'))
      
      const urlInput = screen.getByTestId('video-url-input')
      await user.type(urlInput, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      await user.keyboard('{Enter}')
      
      await waitFor(() => {
        expect(screen.getByTestId('video-caption')).toBeInTheDocument()
      })
      
      await user.type(screen.getByTestId('video-caption'), 'Educational video about web development')
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.stringContaining('Educational video about web development')
        )
      })
    })

    it('should upload local video files', async () => {
      render(<NotionEditor onChange={mockOnChange} />)
      
      const editor = screen.getByTestId('notion-editor')
      await user.type(editor, '/video')
      await user.click(screen.getByText('Video'))
      
      const uploadTab = screen.getByTestId('upload-video-tab')
      await user.click(uploadTab)
      
      const fileInput = screen.getByTestId('video-file-input')
      const videoFile = new File(['fake-video'], 'demo.mp4', { type: 'video/mp4' })
      
      await user.upload(fileInput, videoFile)
      
      await waitFor(() => {
        const videoElement = screen.getByTestId('uploaded-video')
        expect(videoElement).toBeInTheDocument()
        expect(videoElement).toHaveAttribute('src', 'mock-blob-url')
      })
    })
  })

  describe('Media Gallery', () => {
    it('should create media gallery with multiple images', async () => {
      render(<NotionEditor onChange={mockOnChange} />)
      
      const editor = screen.getByTestId('notion-editor')
      await user.type(editor, '/gallery')
      
      await waitFor(() => {
        expect(screen.getByText('Gallery')).toBeInTheDocument()
      })
      
      await user.click(screen.getByText('Gallery'))
      
      const fileInput = screen.getByTestId('gallery-file-input')
      const images = [
        new File(['image1'], 'img1.jpg', { type: 'image/jpeg' }),
        new File(['image2'], 'img2.jpg', { type: 'image/jpeg' }),
        new File(['image3'], 'img3.jpg', { type: 'image/jpeg' })
      ]
      
      await user.upload(fileInput, images)
      
      await waitFor(() => {
        const galleryItems = screen.getAllByTestId('gallery-item')
        expect(galleryItems).toHaveLength(3)
      })
    })

    it('should support gallery layout options', async () => {
      render(<NotionEditor onChange={mockOnChange} />)
      
      const editor = screen.getByTestId('notion-editor')
      await user.type(editor, '/gallery')
      await user.click(screen.getByText('Gallery'))
      
      await waitFor(() => {
        expect(screen.getByTestId('gallery-grid-layout')).toBeInTheDocument()
      })
      
      await user.click(screen.getByTestId('gallery-grid-layout'))
      
      await waitFor(() => {
        const gallery = screen.getByTestId('media-gallery')
        expect(gallery).toHaveClass('grid-layout')
      })
    })
  })

  describe('File Attachments', () => {
    it('should support file attachments', async () => {
      render(<NotionEditor onChange={mockOnChange} />)
      
      const editor = screen.getByTestId('notion-editor')
      await user.type(editor, '/file')
      
      await waitFor(() => {
        expect(screen.getByText('File')).toBeInTheDocument()
      })
      
      await user.click(screen.getByText('File'))
      
      const fileInput = screen.getByTestId('file-input')
      const pdfFile = new File(['fake-pdf'], 'document.pdf', { type: 'application/pdf' })
      
      await user.upload(fileInput, pdfFile)
      
      await waitFor(() => {
        const fileAttachment = screen.getByTestId('file-attachment')
        expect(fileAttachment).toBeInTheDocument()
        expect(fileAttachment).toHaveTextContent('document.pdf')
      })
    })

    it('should show file size and type', async () => {
      render(<NotionEditor onChange={mockOnChange} />)
      
      const editor = screen.getByTestId('notion-editor')
      await user.type(editor, '/file')
      await user.click(screen.getByText('File'))
      
      const fileInput = screen.getByTestId('file-input')
      const docFile = new File(['fake-doc'], 'report.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
      
      await user.upload(fileInput, docFile)
      
      await waitFor(() => {
        const fileInfo = screen.getByTestId('file-info')
        expect(fileInfo).toHaveTextContent('DOCX')
        expect(fileInfo).toHaveTextContent('8 bytes')
      })
    })
  })
})