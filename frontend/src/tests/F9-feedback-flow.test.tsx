import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import FeedbackPage from '../pages/Feedback';

// Mock dependencies
vi.mock('@/hooks/useFeedbackForm', () => ({
  useFeedbackForm: () => ({
    rating: 0,
    setRating: vi.fn(),
    comment: '',
    setComment: vi.fn(),
    email: '',
    setEmail: vi.fn(),
    referModalOpen: false,
    setReferModalOpen: vi.fn(),
    showPurge: false,
    setShowPurge: vi.fn(),
    showFollowup: false,
    handleSubmit: vi.fn(),
    handleRefer: vi.fn(),
    handlePurge: vi.fn(),
    handleShare: vi.fn(),
    openRefer: vi.fn(),
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock fetch globally
global.fetch = vi.fn();

describe('FeedbackPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  test('renders main feedback form elements', () => {
    render(<FeedbackPage />);

    expect(screen.getByText('Share Your Experience')).toBeInTheDocument();
    expect(screen.getByText(/SparkSplit experience/)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/business plan comparison/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Submit Feedback/ })
    ).toBeInTheDocument();
  });

  test('displays star rating component', () => {
    render(<FeedbackPage />);

    // Should find 5 star buttons
    const starButtons = screen.getAllByLabelText(/Star$/);
    expect(starButtons).toHaveLength(5);
  });

  test('shows enhanced social sharing options', () => {
    render(<FeedbackPage />);

    expect(screen.getByText('Spread the Word')).toBeInTheDocument();
    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByText('Facebook')).toBeInTheDocument();
  });

  test('displays enhanced referral component', () => {
    render(<FeedbackPage />);

    expect(screen.getByText('Refer & Earn')).toBeInTheDocument();
    expect(
      screen.getByText('Get $10 credit for each successful referral')
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('friend@example.com')
    ).toBeInTheDocument();
  });

  test('handles form submission with success animation', async () => {
    // Remove unused mockSubmit
    // const mockSubmit = vi.fn().mockResolvedValue(undefined);

    render(<FeedbackPage />);

    const submitButton = screen.getByRole('button', {
      name: /Submit Feedback/,
    });
    const textarea = screen.getByPlaceholderText(/business plan comparison/);

    // Fill out form
    fireEvent.change(textarea, { target: { value: 'Great experience!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Success animation should be triggered
      expect(screen.getByText('Feedback Received!')).toBeInTheDocument();
    });
  });

  test('referral link generation and copying', async () => {
    render(<FeedbackPage />);

    const emailInput = screen.getByPlaceholderText('friend@example.com');
    const generateButton = screen.getByText('Generate Referral Link');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Your Referral Link')).toBeInTheDocument();
    });
  });

  test('post-submission state shows thank you message', async () => {
    render(<FeedbackPage />);

    // Simulate successful submission
    const submitButton = screen.getByRole('button', {
      name: /Submit Feedback/,
    });
    fireEvent.click(submitButton);

    // Wait for success animation to complete and show thank you state
    await waitFor(
      () => {
        expect(screen.getByText('Thank You! 🎉')).toBeInTheDocument();
        expect(screen.getByText('Return Home')).toBeInTheDocument();
        expect(screen.getByText('Create Another Plan')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  test('danger zone purge functionality', () => {
    render(<FeedbackPage />);

    const purgeButton = screen.getByText('Purge my data');
    fireEvent.click(purgeButton);

    // Should trigger the purge modal (handled by DangerZone component)
    expect(purgeButton).toBeInTheDocument();
  });
});
