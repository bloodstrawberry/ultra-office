'use client';

// Suppress known React 19 / React DevTools instrumentation bugs
// (e.g. "We are cleaning up async info that was not on the parent Suspense boundary. This is a bug in React.")
if (typeof window !== 'undefined') {
  const isDevToolsSuspenseBug = (msg: unknown): boolean => {
    if (typeof msg === 'string') {
      return (
        msg.includes('We are cleaning up async info') || msg.includes('parent Suspense boundary')
      );
    }
    if (msg instanceof Error && typeof msg.message === 'string') {
      return (
        msg.message.includes('We are cleaning up async info') ||
        msg.message.includes('parent Suspense boundary')
      );
    }
    return false;
  };

  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    if (args.some(isDevToolsSuspenseBug)) {
      return;
    }
    originalError.apply(console, args);
  };

  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    if (args.some(isDevToolsSuspenseBug)) {
      return;
    }
    originalWarn.apply(console, args);
  };
}
