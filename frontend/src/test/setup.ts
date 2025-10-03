import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

HTMLElement.prototype.scrollTo = vi.fn()

afterEach(() => {
  cleanup()
})
