import '@testing-library/jest-dom'

class TestResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

class TestIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

if (typeof window.ResizeObserver === 'undefined') {
  window.ResizeObserver = TestResizeObserver as unknown as typeof ResizeObserver
}

if (typeof window.IntersectionObserver === 'undefined') {
  window.IntersectionObserver =
    TestIntersectionObserver as unknown as typeof IntersectionObserver
}

if (typeof window.PointerEvent === 'undefined') {
  window.PointerEvent = MouseEvent as unknown as typeof PointerEvent
}

if (typeof HTMLElement.prototype.scrollIntoView !== 'function') {
  HTMLElement.prototype.scrollIntoView = () => undefined
}
