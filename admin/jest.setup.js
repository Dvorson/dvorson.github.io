import '@testing-library/jest-dom'

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(cb) {
    this.cb = cb;
  }
  observe() {
    this.cb([{ borderBoxSize: { inlineSize: 0, blockSize: 0 } }], this);
  }
  unobserve() {}
  disconnect() {}
};

// Mock DOM methods for TipTap
Object.defineProperty(global.Range.prototype, 'getClientRects', {
  value: () => ({
    item: () => null,
    length: 0,
    *[Symbol.iterator]() {}
  })
});

Object.defineProperty(global.Range.prototype, 'getBoundingClientRect', {
  value: () => ({
    bottom: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
    width: 0,
    x: 0,
    y: 0,
  })
});

Object.defineProperty(global.Element.prototype, 'getClientRects', {
  value: () => ({
    item: () => null,
    length: 0,
    *[Symbol.iterator]() {}
  })
});

Object.defineProperty(global.Element.prototype, 'getBoundingClientRect', {
  value: () => ({
    bottom: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
    width: 0,
    x: 0,
    y: 0,
  })
});

Object.defineProperty(global.Document.prototype, 'elementFromPoint', {
  value: () => null
});

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))