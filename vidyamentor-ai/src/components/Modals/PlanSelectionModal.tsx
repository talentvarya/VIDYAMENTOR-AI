import React, { useEffect, useState } from 'react';
import { X, Check, ShieldCheck, ArrowRight, Sparkles, CheckCircle2, Lock } from 'lucide-react';
import { PricingPlan } from '../../types';

interface PlanSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PricingPlan | null;
  billingCycle: 'monthly' | 'annual';
  onProceedToLogin: (classLevel: string) => void;
}

export const PlanSelectionModal: React.FC<PlanSelectionModalProps> = ({
  isOpen,
  onClose,
  plan,
  billingCycle,
  onProceedToLogin,
}) => {
  const [selectedCycle, setSelectedCycle] = useState<'monthly' | 'annual'>(billingCycle);
  const [selectedLangs, setSelectedLangs] = useState<string[]>(['English', 'Hinglish']);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedCycle(billingCycle);
    setSelectedLangs(['English', 'Hinglish']);
    setConfirmed(false);
  }, [billingCycle, isOpen, plan?.id]);

  if (!isOpen || !plan) return null;

  const price = selectedCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
  const cycleLabel = selectedCycle === 'annual' 
    ? (plan.comboDuration || 'per year')
    : 'per month';

  const availableLangs = ['English', 'Hinglish', 'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Gujarati'];

  const toggleLang = (lang: string) => {
    if (selectedLangs.includes(lang)) return;
    setSelectedLangs([selectedLangs[1], lang]);
  };

  const handleProceed = () => {
    setConfirmed(true);
    setTimeout(() => {
      onProceedToLogin(plan.className);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="plan-selection-modal-container"
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg leading-tight">{plan.className} Enrollment</h3>
              {plan.isBestValue && (
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-2xs font-extrabold tracking-wide uppercase">
                  Best Value
                </span>
              )}
            </div>
            <p className="text-blue-100 text-xs font-medium">Education-Only Multilingual Learning</p>
          </div>
          <button
            id="close-plan-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-100 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {!confirmed ? (
            <>
              {/* Pricing breakdown */}
              <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Selected Plan</span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-3xl font-extrabold text-blue-700">{price}</span>
                    <span className="text-xs text-slate-600 font-medium">/ {cycleLabel}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setSelectedCycle('monthly')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedCycle === 'monthly'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCycle('annual')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedCycle === 'annual'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Annual
                  </button>
                </div>
              </div>

              {/* Language Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Pick Your 2 Learning Languages
                  </label>
                  <span className="text-2xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    2 Selected
                  </span>
                </div>
                <p className="text-2xs text-slate-500 mb-2">You can switch explanations in these 2 languages anytime:</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {availableLangs.map((lang) => {
                    const isSelected = selectedLangs.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLang(lang)}
                        className={`py-2 px-1.5 rounded-xl text-xs font-bold border transition-all text-center ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Features Included */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  What's Included in {plan.className}:
                </h4>
                <div className="space-y-2">
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-2xs text-slate-600 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-slate-500" /> Safe, distraction-free study platform
                </span>
                <span className="font-semibold text-slate-700">No Hidden Costs</span>
              </div>

              <button
                id="confirm-plan-enrollment-btn"
                type="button"
                onClick={handleProceed}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all text-sm"
              >
                Proceed to Instant Student Login <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-200">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Setting Up Your {plan.className} Profile...</h4>
              <p className="text-xs text-slate-600">Redirecting to verified Email OTP access...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
