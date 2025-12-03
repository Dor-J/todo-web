import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Suppress Angular ApplicationRef warnings (harmless cleanup warnings)
const originalError = console.error;
console.error = (...args: unknown[]) => {
  const message = args[0]?.toString() || '';
  if (message.includes('NG0406') || message.includes('ApplicationRef has already been destroyed')) {
    return; // Suppress this warning
  }
  originalError.apply(console, args);
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

