import React from 'react';
import { X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Confetti from './Confetti';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const sparkText = (
  <>
    <h3 className="text-xl font-semibold text-canai-card-title mb-4">
      Building Your Local Community Network
    </h3>
    <p className="text-canai-light leading-relaxed mb-4">
      Your business isn't just a service—it's a cornerstone of your community.
      By creating genuine connections with local businesses, you're not just
      expanding your network; you're building a foundation of mutual support
      that elevates everyone.
    </p>
    <p className="text-canai-light leading-relaxed mb-4">
      Start with one meaningful conversation per week. Reach out to
      complementary businesses—not competitors, but allies. A coffee shop
      partnering with a bookstore, a yoga studio connecting with a healthy café.
      These relationships create referral networks that feel natural and
      authentic.
    </p>
    <div className="bg-white/10 rounded-lg p-4 mt-6">
      <p className="text-xs text-canai-light-softer italic">
        "This approach helped us triple our referrals in just 3 months by
        focusing on genuine community building rather than transactional
        networking." - Sarah M., Local Business Owner
      </p>
    </div>
  </>
);

const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = React.useState(false);

  if (!isOpen) return null;

  const handleGetSparks = () => {
    // TODO: POST /v1/generate-preview-spark
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
      navigate('/discovery-funnel');
      onClose();
    }, 1100);
  };

  return (
    <div
      id="spark-preview"
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      style={{ backdropFilter: 'blur(7px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <Confetti active={showConfetti} />
      <div
        className="bg-gradient-to-br from-canai-primary-blue-dark to-canai-blue-card rounded-3xl shadow-2xl max-w-3xl w-full max-h-[94vh] overflow-y-auto relative px-0 py-0 border-4 animate-glow-pop ring-2 ring-canai-primary/30"
        style={{
          borderImage: 'linear-gradient(120deg, #36d1fe 70%, #193c65 100%) 1',
          boxShadow: '0 0 48px 12px #12294a77',
        }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 modal-close transition-colors bg-[#143657]/80 rounded-full p-2 hover:bg-canai-cyan/30 focus-visible:outline-canai-primary"
          aria-label="Close Preview Modal"
        >
          <X size={22} color="#e6f6ff" />
        </button>

        <div className="px-10 py-10 sm:px-14 space-y-8 flex flex-col items-center">
          <div className="text-center">
            <h2
              id="modal-title"
              className="modal-title text-3xl font-bold text-canai-card-title mb-3 select-none"
              tabIndex={0}
            >
              ✨ The Community Spark
            </h2>
            <div className="flex justify-center">
              {/* Voice bubble - "spark" sample */}
              <div className="relative max-w-xl w-full">
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-canai-primary-blue to-canai-glow-cyan shadow-[0_0_36px_#36d1fe99] text-canai-card-title rounded-full px-3 py-1 font-manrope text-sm font-bold uppercase tracking-wide z-10 select-none animate-countup-glow">
                  Spark Example
                </span>
                <div
                  className="bg-canai-primary-blue-glass rounded-2xl border-l-4 border-canai-primary p-8
                  shadow-[0_2px_28px_#36d1fe30] mt-3 mb-3 animate-fade-in voice-bubble"
                  style={{
                    borderImage:
                      'linear-gradient(120deg, #36d1fe 50%, #193c65 100%) 1',
                  }}
                >
                  {sparkText}
                </div>
              </div>
            </div>
          </div>
          <div className="text-center space-y-4">
            <Button
              onClick={handleGetSparks}
              size="lg"
              className="btn-canai text-lg px-10 py-5 shadow-md font-extrabold rounded-2xl transition-all group focus-visible:canai-focus-glow
               animate-glow-pop hover:scale-105"
              aria-label="Claim Your Sparks"
              tabIndex={0}
              autoFocus
            >
              Claim Your Sparks
              <ArrowRight
                className="ml-2 group-hover:translate-x-1 transition-transform"
                size={22}
                color="#e6f6ff"
              />
            </Button>
            <p className="text-xs text-canai-light-softer mt-2">
              Unlock more personalized strategies—crafted just for your
              business!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
