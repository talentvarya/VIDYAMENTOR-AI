import React, { useEffect, useState } from 'react';
import { 
  Check, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Coins,
  Star,
  Info
} from 'lucide-react';
import { PRICING_PLANS } from '../data/content';
import { PricingPlan } from '../types';
import { supabase } from '../lib/supabase';

interface PricingSectionProps {
  onSelectPlan: (plan: PricingPlan, cycle: 'monthly' | 'annual') => void;
  onOpenFreeEducation: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  onSelectPlan,
  onOpenFreeEducation,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [filterCategory, setFilterCategory] = useState<'all' | 'secondary' | 'senior' | 'combos'>('all');
  const [plans, setPlans] = useState<PricingPlan[]>(PRICING_PLANS);

  useEffect(() => {
    if (!supabase) return;
    void supabase
      .from('pricing_plans')
      .select('code,amount_minor,billing_period,features')
      .eq('is_active', true)
      .then(({ data }) => {
        if (!data?.length) return;
        const currency = (amount: number) => `₹${(amount / 100).toLocaleString('en-IN')}`;
        setPlans(PRICING_PLANS.map((plan) => {
          const monthly = data.find((row) => row.code === `${plan.id}-monthly`);
          const annual = data.find((row) => row.code === `${plan.id}-annual`);
          return {
            ...plan,
            monthlyPrice: monthly ? currency(monthly.amount_minor) : plan.monthlyPrice,
            annualPrice: annual ? currency(annual.amount_minor) : plan.annualPrice,
            features: Array.isArray(annual?.features) && annual.features.length
              ? annual.features.map(String)
              : plan.features,
          };
        }));
      });
  }, []);

  const filteredPlans = plans.filter((plan) => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'secondary') return plan.id === 'class-9' || plan.id === 'class-10' || plan.id === 'class-9-10-combo';
    if (filterCategory === 'senior') return plan.id === 'class-11' || plan.id === 'class-12' || plan.id === 'class-11-12-combo';
    if (filterCategory === 'combos') return plan.isCombo;
    return true;
  });

  return (
    <section id="pricing" className="py-12 sm:py-16 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <span className="px-3.5 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-widest inline-flex items-center gap-1.5 mb-3">
            <Coins className="w-3.5 h-3.5" /> Simple, Transparent, School-Focused Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Choose Your Class
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-3 leading-relaxed">
            Affordable learning plans for Classes 9 to 12. No expensive coaching center costs. Select your class or get double-year combos for maximum savings.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="mt-8 inline-flex items-center p-1 bg-slate-100 rounded-full border border-slate-200 shadow-2xs">
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Annual Plans
              <span className="bg-amber-400 text-amber-950 text-2xs px-1.5 py-0.2 rounded font-extrabold ml-1">
                Save 35%+
              </span>
            </button>

            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Plans
            </button>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterCategory === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All 6 Plans
            </button>
            <button
              onClick={() => setFilterCategory('secondary')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterCategory === 'secondary'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Class 9 & 10 (Secondary)
            </button>
            <button
              onClick={() => setFilterCategory('senior')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterCategory === 'senior'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Class 11 & 12 (Higher Secondary)
            </button>
            <button
              onClick={() => setFilterCategory('combos')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterCategory === 'combos'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Best Value Combos
            </button>
          </div>
        </div>

        {/* 6 Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => {
            const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
            const periodLabel = billingCycle === 'annual' 
              ? (plan.comboDuration ? `/${plan.comboDuration}` : '/year') 
              : '/month';

            return (
              <div
                key={plan.id}
                id={`pricing-card-${plan.id}`}
                className={`rounded-[1.5rem] p-6 sm:p-7 border transition-all flex flex-col justify-between relative ${
                  plan.isBestValue
                    ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-600/10'
                    : 'bg-white hover:bg-slate-50/50 border-slate-200 hover:border-blue-300 hover:shadow-sm'
                }`}
              >
                {/* Best Value Badge */}
                {plan.isBestValue && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white font-extrabold text-2xs uppercase tracking-wider py-0.5 px-3 rounded-full shadow-xs flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" />
                    Best Value
                  </div>
                )}

                <div>
                  {/* Top info */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-extrabold text-slate-900">
                      {plan.className}
                    </h3>
                    <span className="text-2xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {plan.popularFor}
                    </span>
                  </div>

                  {/* Price Tag */}
                  <div className="my-4 pb-4 border-b border-slate-100">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                        {price}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {periodLabel}
                      </span>
                    </div>

                    {billingCycle === 'annual' && (
                      <p className="text-2xs text-emerald-600 font-semibold mt-1">
                        Equivalent to just ~{plan.monthlyPrice}/mo for full access
                      </p>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5 mb-6">
                    <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">
                      Everything in {plan.className}:
                    </span>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <div className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[10px] font-bold">✓</span>
                        </div>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card CTA Button */}
                <div className="pt-2">
                  <button
                    id={`btn-${plan.id}`}
                    onClick={() => onSelectPlan(plan, billingCycle)}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      plan.isBestValue
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-blue-50 text-blue-600 border border-slate-200 hover:border-blue-200'
                    }`}
                  >
                    {plan.buttonText}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Financial Aid Bottom Notice */}
        <div className="mt-10 p-6 rounded-[1.5rem] bg-[#F8FAFC] border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Facing genuine financial hardship?
              </h4>
              <p className="text-xs text-slate-600">
                You can apply for 100% Free Normal access through our platform scholarship program.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenFreeEducation}
            className="px-4 py-2.5 bg-white hover:bg-blue-50 text-blue-600 text-xs font-bold rounded-xl border border-slate-200 transition-all shrink-0 cursor-pointer shadow-2xs"
          >
            Apply for Free Education →
          </button>
        </div>

      </div>
    </section>
  );
};
