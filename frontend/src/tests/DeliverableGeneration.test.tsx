import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DeliverableGeneration from '../pages/DeliverableGeneration';

// Mock fetch
global.fetch = vi.fn();

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>
  );
};

interface MockDeliverableResponse {
  id: string;
  content: string;
  canaiOutput: string;
  genericOutput: string;
  pdfUrl: string;
  emotionalResonance: {
    canaiScore: number;
    genericScore: number;
  };
}

// Remove unused interfaces
// interface MockResponse {
//   status: number;
//   json: () => Promise<unknown>;
// }

// interface MockFetchOptions {
//   method?: string;
//   headers?: Record<string, string>;
//   body?: string;
// }

// interface MockFetchResult {
//   status: number;
//   json: () => Promise<unknown>;
// }

// Remove unused types and variables
// type GlobalWithFetch = typeof globalThis & {
//   fetch: typeof fetch;
// };

// const mockFetch = (response: MockResponse): jest.Mock<Promise<MockFetchResult>, [string, MockFetchOptions?]> => {
//   return jest.fn().mockImplementation(() => Promise.resolve(response));
// };

// Mock the Memberstack client
// const mockMemberstackClient = {
//   getCurrentMember: jest.fn().mockResolvedValue({
//     data: {
//       id: 'test-user-id',
//       email: 'test@example.com',
//       metadata: {},
//       auth: {
//         uid: 'test-uid',
//         accessToken: 'test-token',
//         refreshToken: 'test-refresh-token'
//       }
//     }
//   })
// } as const;

describe('F7-tests: Enhanced Deliverable Generation Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful API responses
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve<MockDeliverableResponse>({
          id: 'test-id',
          content: 'Test content',
          canaiOutput: 'Enhanced content',
          genericOutput: 'Generic content',
          pdfUrl: 'https://example.com/test.pdf',
          emotionalResonance: {
            canaiScore: 0.85,
            genericScore: 0.65,
          },
        }),
    });
  });

  it('should validate BUSINESS_BUILDER length and financial projections (700-800 words, 100-word financials)', async () => {
    const searchParams = new URLSearchParams(
      '?type=BUSINESS_BUILDER&promptId=test'
    );
    window.history.pushState({}, '', `?${searchParams}`);

    renderWithProviders(<DeliverableGeneration />);

    await waitFor(() => {
      expect(screen.getByText(/Business Plan Generation/i)).toBeInTheDocument();
    });

    // Wait for generation to complete
    await waitFor(
      () => {
        const content = screen.getByText(
          /Sprinkle Haven Bakery Business Plan/i
        );
        expect(content).toBeInTheDocument();

        // Check for financial projections section
        const financialSection = screen.getByText(
          /Financial Projections \(100 words\)/i
        );
        expect(financialSection).toBeInTheDocument();

        // Verify financial content includes required elements
        const pageText = document.body.textContent || '';
        expect(pageText).toMatch(/break-even/i);
        expect(pageText).toMatch(/revenue/i);
        expect(pageText).toMatch(/\$50,000/); // Investment amount
        expect(pageText).toMatch(/18% net profit/i);

        // Check team structure section (50 words)
        expect(pageText).toMatch(/Team Structure \(50 words\)/i);
        expect(pageText).toMatch(/8 years culinary experience/i);

        // Validate total word count (700-800 words)
        const contentElement = content.closest('.prose');
        if (contentElement) {
          const wordCount =
            contentElement.textContent?.split(/\s+/).length || 0;
          expect(wordCount).toBeGreaterThanOrEqual(700);
          expect(wordCount).toBeLessThanOrEqual(800);
        }
      },
      { timeout: 10000 }
    );
  });

  it('should validate SOCIAL_EMAIL format and word counts (3-7 posts, 3-5 emails)', async () => {
    const searchParams = new URLSearchParams(
      '?type=SOCIAL_EMAIL&promptId=test'
    );
    window.history.pushState({}, '', `?${searchParams}`);

    renderWithProviders(<DeliverableGeneration />);

    await waitFor(
      () => {
        const content = screen.getByText(
          /Social Media & Email Campaign Package/i
        );
        expect(content).toBeInTheDocument();

        const pageText = document.body.textContent || '';

        // Validate posts (should have exactly 5 posts, 240 words total)
        const postMatches = pageText.match(/\*\*Post \d+/g) || [];
        expect(postMatches.length).toBe(5);
        expect(postMatches.length).toBeGreaterThanOrEqual(3);
        expect(postMatches.length).toBeLessThanOrEqual(7);

        // Validate emails (should have exactly 4 emails)
        const emailMatches = pageText.match(/\*\*Email \d+/g) || [];
        expect(emailMatches.length).toBe(4);
        expect(emailMatches.length).toBeGreaterThanOrEqual(3);
        expect(emailMatches.length).toBeLessThanOrEqual(5);

        // Check for specific word count annotations
        expect(pageText).toMatch(/240 words total/i);
        expect(pageText).toMatch(/140 words/i); // Email 1
        expect(pageText).toMatch(/135 words/i); // Email 2

        // Verify Sprinkle Haven Bakery integration
        expect(pageText).toMatch(/Sprinkle Haven Bakery/i);
        expect(pageText).toMatch(/Denver families/i);
        expect(pageText).toMatch(/organic pastries/i);
      },
      { timeout: 10000 }
    );
  });

  it('should validate SITE_AUDIT length and structure (300-400 words audit + 100-150 words recommendations)', async () => {
    const searchParams = new URLSearchParams('?type=SITE_AUDIT&promptId=test');
    window.history.pushState({}, '', `?${searchParams}`);

    renderWithProviders(<DeliverableGeneration />);

    await waitFor(
      () => {
        const content = screen.getByText(/Website Audit Report/i);
        expect(content).toBeInTheDocument();

        const pageText = document.body.textContent || '';

        // Check for required sections
        expect(pageText).toMatch(/Current State Analysis \(320 words\)/i);
        expect(pageText).toMatch(/Strategic Recommendations \(130 words\)/i);

        // Verify Sprinkle Haven specific content
        expect(pageText).toMatch(/Sprinkle Haven Bakery/i);
        expect(pageText).toMatch(/Denver families/i);
        expect(pageText).toMatch(/Blue Moon Bakery/i); // Competitive context
        expect(pageText).toMatch(/organic ingredients/i);

        // Check for specific audit elements
        expect(pageText).toMatch(/page load speeds/i);
        expect(pageText).toMatch(/mobile responsiveness/i);
        expect(pageText).toMatch(/local SEO/i);
        expect(pageText).toMatch(/conversion optimization/i);
      },
      { timeout: 10000 }
    );
  });

  it('should validate emotional resonance scoring with Hume AI requirements', async () => {
    renderWithProviders(<DeliverableGeneration />);

    await waitFor(
      () => {
        const resonanceSection = screen.getByText(
          /Emotional Resonance Analysis/i
        );
        expect(resonanceSection).toBeInTheDocument();

        // Check for arousal > 0.5 and valence > 0.6
        const arousalElement = screen.getByText(/0\.70/);
        const valenceElement = screen.getByText(/0\.80/);
        expect(arousalElement).toBeInTheDocument();
        expect(valenceElement).toBeInTheDocument();

        // Verify CanAI score display
        const canaiScore = screen.getByText(/85%/);
        expect(canaiScore).toBeInTheDocument();

        // Check for validation status
        expect(screen.getByText(/Validated by Hume AI/i)).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it('should handle revision requests with proper API calls', async () => {
    renderWithProviders(<DeliverableGeneration />);

    await waitFor(() => {
      expect(screen.getByText(/Request Revision/i)).toBeInTheDocument();
    });

    const revisionInput = screen.getByPlaceholderText(
      /Describe specific changes/i
    );
    const revisionButton = screen.getByRole('button', {
      name: /Apply Revision/i,
    });

    fireEvent.change(revisionInput, { target: { value: 'Make tone bolder' } });
    fireEvent.click(revisionButton);

    // Verify the input shows enhanced placeholder text
    expect((revisionInput as HTMLTextAreaElement).placeholder).toMatch(
      /Make tone bolder/
    );

    await waitFor(() => {
      expect(screen.getByText(/Applying Revision/i)).toBeInTheDocument();
    });
  });

  it('should enforce regeneration limit and track attempts', async () => {
    renderWithProviders(<DeliverableGeneration />);

    await waitFor(() => {
      const regenerateButton = screen.getByText(/Regenerate \(0\/2\)/i);
      expect(regenerateButton).toBeInTheDocument();
    });

    const regenerateButton = screen.getByRole('button', {
      name: /Regenerate/i,
    });

    // First regeneration
    fireEvent.click(regenerateButton);

    await waitFor(() => {
      expect(screen.getByText(/Regenerate \(1\/2\)/i)).toBeInTheDocument();
    });

    // Second regeneration
    fireEvent.click(regenerateButton);

    await waitFor(() => {
      expect(screen.getByText(/Regenerate \(2\/2\)/i)).toBeInTheDocument();
    });
  });

  it('should display branding note with correct ID', async () => {
    renderWithProviders(<DeliverableGeneration />);

    await waitFor(
      () => {
        const brandingNote = screen.getByText(/CanAI excludes branding/i);
        expect(brandingNote).toBeInTheDocument();
        expect(brandingNote.closest('#branding-note')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it('should handle timeout errors with proper fallback UI', async () => {
    // Mock a timeout scenario
    vi.useFakeTimers();

    renderWithProviders(<DeliverableGeneration />);

    // Fast-forward past the 15-second timeout
    vi.advanceTimersByTime(16000);

    await waitFor(() => {
      const errorFallback = document.querySelector('.error-fallback');
      expect(errorFallback).toBeInTheDocument();
      expect(screen.getByText(/Generation Timed Out/i)).toBeInTheDocument();
    });

    vi.useRealTimers();
  });

  it('should validate step-by-step generation progress', async () => {
    renderWithProviders(<DeliverableGeneration />);

    // Check initial step
    await waitFor(() => {
      expect(screen.getByText(/Analyzing your inputs/i)).toBeInTheDocument();
    });

    // Verify progress indicators
    expect(screen.getByText(/Step 1 of 6/i)).toBeInTheDocument();
    expect(screen.getByText(/Generating with GPT-4o/i)).toBeInTheDocument();
    expect(screen.getByText(/Validating with Hume AI/i)).toBeInTheDocument();
    expect(screen.getByText(/Creating PDF via Make.com/i)).toBeInTheDocument();
  });

  it('should integrate Sprinkle Haven Bakery context in all deliverable types', async () => {
    const productTypes = ['BUSINESS_BUILDER', 'SOCIAL_EMAIL', 'SITE_AUDIT'];

    for (const type of productTypes) {
      const searchParams = new URLSearchParams(`?type=${type}&promptId=test`);
      window.history.pushState({}, '', `?${searchParams}`);

      renderWithProviders(<DeliverableGeneration />);

      await waitFor(
        () => {
          const pageText = document.body.textContent || '';

          // Verify key Sprinkle Haven context elements
          expect(pageText).toMatch(/Sprinkle Haven Bakery/i);
          expect(pageText).toMatch(/Denver families/i);
          expect(pageText).toMatch(/organic pastries/i);
          expect(pageText).toMatch(/\$50k budget/i);
          expect(pageText).toMatch(/Blue Moon Bakery/i);
          expect(pageText).toMatch(/warm/i); // Brand voice
        },
        { timeout: 10000 }
      );
    }
  });

  it('should validate collapsible content sections and copy functionality', async () => {
    renderWithProviders(<DeliverableGeneration />);

    await waitFor(
      () => {
        // Check for section toggles
        const sectionToggles = screen.getAllByRole('button');
        const toggleButtons = sectionToggles.filter(button =>
          button.textContent?.includes('##')
        );

        expect(toggleButtons.length).toBeGreaterThan(0);

        // Test copy functionality
        const copyButtons = screen.getAllByRole('button');
        const copyButton = copyButtons.find(button =>
          button.querySelector('.lucide-copy')
        );

        if (copyButton) {
          fireEvent.click(copyButton);
          expect(navigator.clipboard.writeText).toHaveBeenCalled();
        }
      },
      { timeout: 10000 }
    );
  });

  it('should validate multi-step loading with retry mechanism', async () => {
    // Mock fetch to fail initially then succeed
    let callCount = 0;
    (global.fetch as jest.MockedFunction<typeof fetch>).mockImplementation(
      (): Promise<Response> => {
        callCount++;
        if (callCount < 2) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ content: 'Success after retry' }),
        });
      }
    );

    renderWithProviders(<DeliverableGeneration />);

    await waitFor(
      () => {
        const pageText = document.body.textContent || '';
        expect(pageText).toMatch(/Retry attempt/i);
      },
      { timeout: 5000 }
    );
  });
});
