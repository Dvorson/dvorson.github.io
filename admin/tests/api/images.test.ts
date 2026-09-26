/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import * as fs from 'fs/promises'
import * as os from 'os'
import * as path from 'path'
import { POST as uploadHandler } from '../../src/app/api/images/route'
import { referencedImagePaths } from '../../src/lib/images'

// Smallest valid PNG: 1x1 transparent pixel.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
)

function upload(file?: File) {
  const body = new FormData()
  if (file) body.append('file', file)
  return uploadHandler(new NextRequest('http://localhost:3001/api/images', { method: 'POST', body }))
}

describe('image upload API', () => {
  let imagesDir: string

  beforeEach(async () => {
    imagesDir = await fs.mkdtemp(path.join(os.tmpdir(), 'images-'))
    process.env.IMAGES_DIR = imagesDir
  })

  afterEach(async () => {
    delete process.env.IMAGES_DIR
    await fs.rm(imagesDir, { recursive: true, force: true })
  })

  it('stores the image under a content-hashed name and returns its public path', async () => {
    const response = await upload(new File([PNG], 'My Chart.png', { type: 'image/png' }))
    expect(response.status).toBe(200)

    const { src } = await response.json()
    expect(src).toMatch(/^\/img\/posts\/my-chart-[0-9a-f]{10}\.png$/)
    const stored = await fs.readFile(path.join(imagesDir, path.basename(src)))
    expect(stored.equals(PNG)).toBe(true)
  })

  it('gives the same file the same name on re-upload', async () => {
    const first = await (await upload(new File([PNG], 'a.png', { type: 'image/png' }))).json()
    const second = await (await upload(new File([PNG], 'a.png', { type: 'image/png' }))).json()
    expect(second.src).toBe(first.src)
    expect(await fs.readdir(imagesDir)).toHaveLength(1)
  })

  it.each([
    ['SVG, which can carry script', new File(['<svg onload="alert(1)"/>'], 'x.svg', { type: 'image/svg+xml' })],
    ['a non-image', new File(['hello'], 'notes.txt', { type: 'text/plain' })],
    ['a file over 10MB', new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'big.png', { type: 'image/png' })],
  ])('rejects %s', async (_label, file) => {
    const response = await upload(file)
    expect(response.status).toBe(400)
    expect(await fs.readdir(imagesDir)).toEqual([])
  })

  it('rejects a request without a file', async () => {
    expect((await upload()).status).toBe(400)
  })
})

describe('referencedImagePaths', () => {
  beforeEach(() => {
    process.env.IMAGES_DIR = '/site/public/img/posts'
  })
  afterEach(() => {
    delete process.env.IMAGES_DIR
  })

  it('finds each uploaded image a post uses, once', () => {
    const content = '<p><img src="/img/posts/a-0123456789.png"></p><img src="/img/posts/a-0123456789.png"><img src="/img/posts/b-abcdef0123.webp">'
    expect(referencedImagePaths(content)).toEqual([
      '/site/public/img/posts/a-0123456789.png',
      '/site/public/img/posts/b-abcdef0123.webp',
    ])
  })

  it('ignores external images and paths outside the upload folder', () => {
    const content = '<img src="https://example.com/x.png"><img src="/img/cases/x.png"><img src="/img/posts/../../secrets.png">'
    expect(referencedImagePaths(content)).toEqual([])
  })
})
