import React, { useState } from 'react';
import { 
  ChevronDown, 
  HelpCircle, 
  Search, 
  Sparkles, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { FAQ_LIST } from '../data/content';

interface FAQSectionProps {
  onOpenFreeEducation: () => void;
  onOpenSchoolEnquiry: () => void;
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  onOpenFreeEducation,
  onOpenSchoolEnquiry,
}) => {
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const filteredFaqs = FAQ_LIST.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section id="faq" className="py-12 sm:py-16 bg-white border-b border-slate-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12">
          <span className="px-3.5 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-widest inline-flex items-center gap-1.5 mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" /> Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-base text-slate-600 mt-3 leading-relaxed">
            Everything you need to know about classes, languages, safety, pricing, and school accounts.
          </p>

          {/* Quick FAQ Search Bar */}
          <div className="relative max-w-md mx-auto mt-6">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="faq-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions (e.g., languages, classes, fees, safety)..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-2xs text-slate-400 hover:text-slate-600 font-bold"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Accordion FAQ List */}
        <div className="space-y-3">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  id={`faq-item-${faq.id}`}
                  className="bg-[#F8FAFC] rounded-2xl border border-slate-200/80 overflow-hidden transition-all shadow-xs"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full px-5 sm:px-6 py-4.5 text-left flex items-center justify-between gap-4 hover:bg-slate-100/60 transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                      {faq.question}
                    </span>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-blue-50 text-blue-600' : 'bg-white text-slate-500 border border-slate-200'
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/80 bg-white">
                      <p className="font-normal">{faq.answer}</p>
                      {faq.id === 'faq-4' && (
                        <div className="mt-3">
                          <button
                            onClick={onOpenFreeEducation}
                            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                          >
                            Click here to Apply for Free Education →
                          </button>
                        </div>
                      )}
                      {faq.id === 'faq-5' && (
                        <div className="mt-3">
                          <button
                            onClick={onOpenSchoolEnquiry}
                            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                          >
                            Click here for Institutional School Enquiry →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 bg-[#F8FAFC] rounded-2xl border border-slate-200 p-6">
              <p className="text-sm text-slate-500">No questions found matching "{searchQuery}".</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs text-blue-600 font-bold underline"
              >
                Show all 8 questions
              </button>
            </div>
          )}
        </div>

        {/* Still have questions card */}
        <div className="mt-10 p-6 bg-[#F8FAFC] rounded-[1.5rem] border border-slate-200/80 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Still have questions or need guidance?</h4>
            <p className="text-xs text-slate-600 mt-0.5 font-normal">Our academic support desk is here to assist parents, students, and teachers.</p>
          </div>
          <a
            href="mailto:support@vidyamentor.ai"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs shrink-0 inline-flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Contact Support Desk
          </a>
        </div>

      </div>
    </section>
  );
};
