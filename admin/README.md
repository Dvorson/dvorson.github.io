# Blog Admin - Modern Notion-style Editor

A modern blog administration interface built with Next.js 14, featuring a rich Notion-style editor with comprehensive functionality for creating and managing blog posts.

## ✨ Features

### Rich Text Editing
- **Bold, Italic, Strikethrough** formatting with keyboard shortcuts
- **Headings** (H1, H2, H3) with markdown syntax support
- **Lists** (bullet and numbered) with automatic continuation
- **Code blocks** with syntax highlighting
- **Blockquotes** for callouts and quotes
- **Links** with markdown syntax support
- **Inline code** formatting

### Advanced Editor Features
- **Drag & Drop Blocks** - Reorder content blocks by dragging
- **Slash Commands** - Type `/` to access quick commands menu
- **Tables** with resizable columns and sortable data
- **Math Formulas** with LaTeX support (inline and block)
- **Image Upload** with drag & drop and progress indicators
- **Video Embedding** (YouTube, Vimeo, direct files)
- **File Attachments** with size and type display

### Content Management
- **Draft Saving** - Save work-in-progress posts
- **Publishing** - Publish posts with git integration
- **Auto-generated slugs** from titles
- **Tags and Categories** for content organization
- **Markdown Export** - Content saved as markdown files

## 🛠 Technology Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **TipTap** - Extensible rich text editor
- **Tailwind CSS** - Utility-first styling
- **Jest + Testing Library** - Unit and integration testing
- **Playwright** - End-to-end testing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Navigate to the admin directory:
   ```bash
   cd admin-new
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3001](http://localhost:3001) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 📁 Project Structure

```
admin-new/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   ├── draft/         # Draft saving endpoint
│   │   │   └── publish/       # Publishing endpoint
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main admin page
│   ├── components/            # React components
│   │   ├── editor/            # Editor-specific components
│   │   │   ├── SlashCommandMenu.tsx
│   │   │   ├── DragHandle.tsx
│   │   │   ├── ImageUpload.tsx
│   │   │   ├── VideoEmbed.tsx
│   │   │   └── MathEditor.tsx
│   │   ├── NotionEditor.tsx   # Main editor component
│   │   └── PostForm.tsx       # Post metadata form
│   └── types/                 # TypeScript type definitions
├── tests/                     # Test files
│   ├── editor/               # Editor functionality tests
│   │   ├── rich-text.test.tsx
│   │   ├── drag-drop.test.tsx
│   │   ├── tables.test.tsx
│   │   ├── formulas.test.tsx
│   │   └── media.test.tsx
│   ├── api/                  # API endpoint tests
│   └── e2e/                  # End-to-end tests
└── package.json
```

## 🧪 Testing

The project includes comprehensive test coverage:

### Unit Tests
- Rich text editing functionality
- Drag & drop block reordering
- Table creation and manipulation
- Math formula rendering
- Image and video embedding
- API endpoint functionality

### End-to-End Tests
- Complete blog post creation workflow
- Editor interactions and formatting
- Content saving and publishing
- Cross-browser compatibility

Run tests:
```bash
# Unit tests
npm test

# E2E tests  
npm run test:e2e

# Coverage report
npm run test:coverage
```

## 📝 Content Flow

1. **Content Creation** - Use the rich editor to create blog posts
2. **Draft Saving** - Save drafts to `../site/src/posts/_drafts/`
3. **Publishing** - Publish posts to `../site/src/posts/` with git commit
4. **Site Generation** - Astro builds static site from markdown files
5. **Deployment** - GitHub Actions deploys to GitHub Pages

## 🎨 Editor Usage

### Slash Commands
Type `/` anywhere in the editor to open the commands menu:
- `/heading1` - Large heading
- `/heading2` - Medium heading  
- `/heading3` - Small heading
- `/bulletlist` - Bullet list
- `/numberedlist` - Numbered list
- `/quote` - Blockquote
- `/code` - Code block
- `/table` - Insert table
- `/image` - Upload image
- `/video` - Embed video
- `/math` - Math equation

### Keyboard Shortcuts
- `Ctrl+B` - Bold text
- `Ctrl+I` - Italic text
- `Ctrl+Z` - Undo
- `Ctrl+Y` - Redo
- `Ctrl+A` - Select all
- `Ctrl+D` - Duplicate block

### Drag & Drop
- Hover over any block to see the drag handle
- Drag blocks to reorder content
- Drop zones appear during drag operations

## 🔧 Configuration

The editor can be customized by modifying:
- `src/components/NotionEditor.tsx` - Main editor configuration
- `src/components/editor/SlashCommandMenu.tsx` - Available commands
- `tailwind.config.js` - Styling and theme
- `src/app/globals.css` - Editor-specific styles

## 🚀 Deployment

The admin interface runs locally only. For production use:

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

3. Access at [http://localhost:3001](http://localhost:3001)

## 🔒 Security

- Posts are saved as local markdown files
- No external database dependencies  
- Git integration for version control
- Input validation for all form fields
- File upload size and type restrictions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is part of a personal blog system and follows the same license as the parent repository.