/// <reference types="vite/client" />

// Add posthog to the global Window type so TypeScript recognizes it
interface Window {
  posthog?: any; // You can replace 'any' with the actual PostHog type if available
}
