import React, { useState, useEffect } from 'react';
import EnhancedHero from '@/components/DiscoveryHook/EnhancedHero';
import PsychologicalTrustIndicators from '@/components/DiscoveryHook/PsychologicalTrustIndicators';
import ProductCardsSection from '@/components/DiscoveryHook/ProductCardsSection';
import EnhancedSecondaryCTAs from '@/components/DiscoveryHook/EnhancedSecondaryCTAs';
import PricingModal from '@/components/PricingModal';
import PreviewModal from '@/components/PreviewModal';
import MemberstackLoginButton from '@/components/DiscoveryHook/MemberstackLoginButton';
import { BackgroundImage } from '@/components/ui/background-image';
import { useAccessibility } from '@/hooks/useAccessibility';

// Import API and analytics utilities
import { getMessages, logInteraction } from '@/utils/api';
import {
  trackPageView,
  trackFunnelStep,
  trackPricingView,
  trackPreviewView,
} from '@/utils/analytics';

// Demo auth logic (customize later)
const useFakeAuth = () => ({ isLoggedIn: true, userName: 'Taylor' });

const DiscoveryHook = () => {
  const [isPricingOpen, setPricingOpen] = useState(false);
  const [isPreviewOpen, setPreviewOpen] = useState(false);
  const [loadTime, setLoadTime] = useState<number>(0);
  const { isLoggedIn, userName } = useFakeAuth();
  const { setPageTitle, announce } = useAccessibility();

  // Performance tracking
  useEffect(() => {
    const startTime = performance.now();

    // Set page title and announce to screen readers
    setPageTitle('Discovery Hook - Explore CanAI Solutions');

    const initializePage = async () => {
      try {
        // Track page view
        trackPageView('discovery_hook');
        trackFunnelStep('landing', {
          user_type: isLoggedIn ? 'returning' : 'new',
        });

        // Load initial messages
        const messages = await getMessages();
        console.log('[Discovery Hook] Messages loaded:', messages);

        // Log page interaction
        await logInteraction({
          user_id: isLoggedIn ? 'demo-user-id' : undefined,
          interaction_type: 'page_view',
          interaction_details: {
            page: 'discovery_hook',
            user_type: isLoggedIn ? 'returning' : 'new',
            timestamp: new Date().toISOString(),
          },
        });

        // Calculate load time
        const endTime = performance.now();
        const loadDuration = endTime - startTime;
        setLoadTime(loadDuration);

        console.log(
          `[Performance] Discovery Hook loaded in ${loadDuration.toFixed(2)}ms`
        );

        // Performance target: <1.5s (1500ms)
        if (loadDuration > 1500) {
          console.warn(
            '[Performance] Page load exceeded 1.5s target:',
            loadDuration
          );
        }

        // Announce page load completion
        announce(
          'Discovery Hook page loaded successfully. Use tab to navigate or activate screen reader.',
          'polite'
        );
      } catch (error) {
        console.error('[Discovery Hook] Initialization failed:', error);

        // Announce error to screen readers
        announce(
          'Page loading encountered an error. Some features may not work properly.',
          'assertive'
        );

        // F1-E1: Fallback to localStorage
        try {
          const fallbackData = {
            user_type: isLoggedIn ? 'returning' : 'new',
            timestamp: new Date().toISOString(),
            fallback_reason: 'api_failure',
          };
          localStorage.setItem(
            'canai_discovery_fallback',
            JSON.stringify(fallbackData)
          );
          console.log('[F1-E1] Fallback data saved to localStorage');
        } catch (storageError) {
          console.error('[F1-E1] localStorage fallback failed:', storageError);
        }
      }
    };

    initializePage();
  }, [isLoggedIn, setPageTitle, announce]);

  const handlePricingOpen = () => {
    trackPricingView('secondary_cta');
    trackFunnelStep('pricing_viewed');
    announce('Opening pricing modal', 'polite');
    setPricingOpen(true);
  };

  const handlePreviewOpen = () => {
    trackPreviewView('spark_preview');
    trackFunnelStep('preview_viewed');
    announce('Opening preview modal', 'polite');
    setPreviewOpen(true);
  };

  const handleStart = () => {
    trackFunnelStep('begin_journey', { source: 'hero_cta' });

    // Log interaction
    logInteraction({
      user_id: isLoggedIn ? 'demo-user-id' : undefined,
      interaction_type: 'cta_clicked',
      interaction_details: {
        cta_type: 'begin_journey',
        source: 'hero',
        user_type: isLoggedIn ? 'returning' : 'new',
      },
    });

    announce('Starting your CanAI journey', 'polite');
    window.location.assign('/discovery-funnel');
  };

  return (
    <>
      {/* Skip to Content Link */}
      <a
        href="#main-content"
        className="skip-link"
        onFocus={() => announce('Skip to main content link focused', 'polite')}
      >
        Skip to main content
      </a>

      <BackgroundImage
        src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80&fm=webp"
        alt="Digital technology matrix background representing AI-powered business intelligence and data processing"
        className="min-h-screen"
        overlay={true}
        overlayOpacity={0.75}
      >
        {/* Memberstack login button (top right) */}
        <MemberstackLoginButton />

        {/* Modal Placeholders for Error Handling */}
        <div
          id="login-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-modal-title"
          className="hidden fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
          data-component="login-modal"
        >
          <div className="bg-white rounded-xl p-8 shadow-xl text-center w-[350px] max-w-[90vw]">
            <h2
              id="login-modal-title"
              className="text-xl font-bold mb-2 text-canai-dark"
            >
              Login Required
            </h2>
            <p className="mb-4 text-canai-dark">Please log in to continue.</p>
            <button
              className="bg-[#00CFFF] text-white font-semibold px-8 py-3 rounded-lg min-h-[44px] min-w-[44px]"
              aria-label="Log In to CanAI Platform"
            >
              Log In
            </button>
          </div>
        </div>

        <div
          id="error-modal"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="error-modal-title"
          className="hidden fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
        >
          <div className="bg-white rounded-xl p-8 shadow-xl text-center w-[350px] max-w-[90vw]">
            <h2
              id="error-modal-title"
              className="text-xl font-bold mb-2 text-canai-red"
            >
              Something Went Wrong
            </h2>
            <p className="mb-4 text-canai-dark">
              An error occurred. Please try again later.
            </p>
            <button
              className="bg-[#00CFFF] text-white font-semibold px-8 py-3 rounded-lg min-h-[44px] min-w-[44px]"
              aria-label="Dismiss error message"
            >
              Dismiss
            </button>
          </div>
        </div>

        <main
          id="main-content"
          className="flex-1 w-full flex flex-col items-center justify-center relative z-10"
          aria-label="CanAI Emotional Sovereignty Platform Landing"
          role="main"
        >
          {/* Enhanced HERO */}
          <section aria-label="Hero section with platform introduction">
            <EnhancedHero
              userName={isLoggedIn ? userName : undefined}
              onStart={handleStart}
            />
          </section>

          {/* Psychological Trust Indicators */}
          <section aria-label="Trust indicators and social proof">
            <PsychologicalTrustIndicators />
          </section>

          {/* Product Cards */}
          <div className="flex flex-col w-full items-center px-2 sm:px-0">
            <section aria-label="Product offerings and features">
              <ProductCardsSection />
            </section>

            {/* Enhanced Secondary CTAs */}
            <section aria-label="Additional actions and options">
              <EnhancedSecondaryCTAs
                onOpenPricing={handlePricingOpen}
                onOpenPreview={handlePreviewOpen}
              />
            </section>
          </div>

          {/* Modals */}
          <PricingModal
            isOpen={isPricingOpen}
            onClose={() => {
              announce('Pricing modal closed', 'polite');
              setPricingOpen(false);
            }}
          />
          <PreviewModal
            isOpen={isPreviewOpen}
            onClose={() => {
              announce('Preview modal closed', 'polite');
              setPreviewOpen(false);
            }}
          />
        </main>

        {/* Performance Debug Info (remove in production) */}
        {process.env.NODE_ENV === 'development' && loadTime > 0 && (
          <div
            className="fixed bottom-4 left-4 bg-black/80 text-white p-2 rounded text-xs z-50"
            aria-live="polite"
            role="status"
          >
            Load Time: {loadTime.toFixed(2)}ms
            {loadTime > 1500 && (
              <span className="text-red-400"> (⚠️ &gt;1.5s)</span>
            )}
          </div>
        )}

        {/* Hidden live region for screen reader announcements */}
        <div
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
          id="announcements"
        ></div>
      </BackgroundImage>
    </>
  );
};

export default DiscoveryHook;
