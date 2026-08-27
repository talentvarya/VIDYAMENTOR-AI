import React, { useState } from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  Languages, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  BookOpen, 
  Calculator,
  Atom,
  HelpCircle,
  Volume2,
  BookmarkCheck
} from 'lucide-react';

interface HeroProps {
  onOpenStudentLogin: () => void;
  onSelectClass: (className: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenStudentLogin, onSelectClass }) => {
  const [activeLang, setActiveLang] = useState<'english' | 'hinglish' | 'hindi'>('hinglish');
  const [activeSubject, setActiveSubject] = useState<'maths' | 'physics' | 'biology'>('maths');

  const heroContent = {
    maths: {
      class: 'Class 10 CBSE',
      subject: 'Mathematics',
      chapter: 'Ch 4: Quadratic Equations',
      question: 'Quadratic Formula kab use karte hain aur derivation kya hai?',
      hinglish: 'Jab middle term split karna tough ho, tab Quadratic Formula x = (-b ± √(b² - 4ac)) / (2a) lagao. b² - 4ac ko Discriminant (D) kehte hain!',
      english: 'Use the Quadratic Formula x = (-b ± √(b² - 4ac)) / (2a) when direct factoring is difficult. The term b² - 4ac is called the Discriminant (D).',
      hindi: 'द्विघाती सूत्र x = (-b ± √(b² - 4ac)) / (2a) का प्रयोग तब करें जब गुणनखंड करना कठिन हो। b² - 4ac को विविक्तकर (Discriminant) कहा जाता है।',
      source: 'NCERT Mathematics Class 10 — Page 85',
      formula: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
    },
    physics: {
      class: 'Class 11 CBSE',
      subject: 'Physics',
      chapter: 'Ch 5: Laws of Motion',
      question: 'Newton ka 2nd Law F=ma ka real intuition kya hai?',
      hinglish: 'F = ma ka matlab hai jitna zyada mass hoga, utna zyada force chahiye hoga acceleration ke liye. Cricket ball catch karte time haath peeche kheecho taaki impact time badhe!',
      english: 'F = ma shows that force equals rate of change of momentum. A cricket fielder cushions the catch by pulling hands back to increase impact duration.',
      hindi: 'बल संवेग परिवर्तन की दर के समानुपाती होता है (F = dp/dt = ma)। कैच लेते समय खिलाड़ी हाथ पीछे खींचकर आघात के समय को बढ़ाता है।',
      source: 'NCERT Physics Class 11 — Part 1',
      formula: 'F = m \\cdot a = \\frac{dp}{dt}',
    },
    biology: {
      class: 'Class 10 CBSE',
      subject: 'Science (Biology)',
      chapter: 'Ch 6: Life Processes',
      question: 'Photosynthesis ke 3 main steps kya hain?',
      hinglish: '1. Chlorophyll sunlight absorb karega. 2. Light energy se Paani (H₂O) tootega. 3. CO₂ reduce hokar glucose banayega!',
      english: '1. Light absorption by chlorophyll. 2. Splitting of water into H₂ and O₂. 3. Reduction of CO₂ into glucose carbohydrates.',
      hindi: '1. क्लोरोफिल द्वारा प्रकाश ऊर्जा का अवशोषण। 2. जल का हाइड्रोजन तथा ऑक्सीजन में अपघटन। 3. कार्बन डाइऑक्साइड का कार्बोहाइड्रेट में अपचयन।',
      source: 'NCERT Science Class 10 — Life Processes',
      formula: '6CO_2 + 6H_2O \\rightarrow C_6H_{12}O_6 + 6O_2',
    }
  };

  const currentSnippet = heroContent[activeSubject];

  return (
    <section id="home" className="py-6 sm:py-8 bg-[#F8FAFC] border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column: Hero Main Card (Clean Utility / Minimal) */}
          <div className="lg:col-span-7 bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Top Badge */}
            <div className="flex items-center justify-between gap-3 mb-6">
              <span className="px-3.5 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-widest inline-flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                Classes 9–12 Only
              </span>
              <span className="text-2xs font-semibold text-slate-400 font-mono hidden sm:inline">
                VIDYAMENTOR AI
              </span>
            </div>

            {/* Main Headline */}
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-4">
                Learn Smarter in the <br className="hidden sm:inline" />
                <span className="text-blue-600">Language</span> You Understand Best
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-slate-600 mb-8 max-w-xl leading-relaxed font-normal">
                Education-only AI for Class 9–12 students. Simple explanations, multilingual support, chapter-wise lessons, and exam mastery.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-8">
                <button
                  id="hero-student-login-cta"
                  onClick={onOpenStudentLogin}
                  className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-7 py-4 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 shadow-sm shadow-blue-200 transition-all cursor-pointer hover:-translate-y-0.5"
                >
                  Student Login
                  <ArrowRight className="w-5 h-5" />
                </button>

                <a
                  id="hero-explore-plans-cta"
                  href="#pricing"
                  className="border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 px-7 py-4 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition-all cursor-pointer text-center"
                >
                  Explore Plans
                </a>
              </div>

              {/* Quick Class Direct Jump Chips */}
              <div className="flex items-center gap-2 flex-wrap mb-6 pt-1">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Select Class:</span>
                {['Class 9', 'Class 10', 'Class 11', 'Class 12'].map((cls) => (
                  <button
                    key={cls}
                    onClick={() => onSelectClass(cls)}
                    className="px-3 py-1 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-bold rounded-lg border border-slate-200 hover:border-blue-200 transition-all cursor-pointer"
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            {/* Feature Checklist (Bottom of Hero Card) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-100 pt-6">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <span className="text-green-600 text-[10px] font-bold">✓</span>
                </div>
                <span className="text-xs sm:text-sm text-slate-600 font-medium">Education-Only AI</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <span className="text-green-600 text-[10px] font-bold">✓</span>
                </div>
                <span className="text-xs sm:text-sm text-slate-600 font-medium">2 Learning Languages</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <span className="text-green-600 text-[10px] font-bold">✓</span>
                </div>
                <span className="text-xs sm:text-sm text-slate-600 font-medium">Safe Student Platform</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Study Sandbox (Clean Utility Blue Card) */}
          <div className="lg:col-span-5 bg-blue-600 rounded-[2rem] p-6 sm:p-8 text-white flex flex-col justify-between relative overflow-hidden shadow-sm">
            {/* Background decor subtle ring */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full -mr-20 -mt-20 opacity-40 pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full justify-between gap-5">
              
              {/* Header inside Sandbox */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs sm:text-sm font-bold bg-white/20 px-3 py-1 rounded-lg backdrop-blur-md italic flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    Ask VIDYAMENTOR AI
                  </span>
                  <div className="flex gap-1.5 items-center">
                    <button 
                      onClick={() => setActiveSubject('maths')}
                      className={`px-2 py-0.5 rounded text-2xs font-bold transition-all ${activeSubject === 'maths' ? 'bg-white text-blue-600' : 'bg-white/20 text-white'}`}
                    >
                      Maths
                    </button>
                    <button 
                      onClick={() => setActiveSubject('physics')}
                      className={`px-2 py-0.5 rounded text-2xs font-bold transition-all ${activeSubject === 'physics' ? 'bg-white text-blue-600' : 'bg-white/20 text-white'}`}
                    >
                      Physics
                    </button>
                    <button 
                      onClick={() => setActiveSubject('biology')}
                      className={`px-2 py-0.5 rounded text-2xs font-bold transition-all ${activeSubject === 'biology' ? 'bg-white text-blue-600' : 'bg-white/20 text-white'}`}
                    >
                      Biology
                    </button>
                  </div>
                </div>

                {/* Prompt Bubble */}
                <div className="bg-white/10 border border-white/20 rounded-2xl p-3.5 backdrop-blur-sm">
                  <p className="text-xs sm:text-sm font-medium italic opacity-95">
                    “{currentSnippet.question}”
                  </p>
                </div>
              </div>

              {/* White Response Card */}
              <div className="bg-white rounded-2xl p-5 text-slate-800 flex-1 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100 rounded text-blue-600 flex items-center justify-center text-[10px] font-bold">
                        AI
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {currentSnippet.class} • {currentSnippet.subject}
                      </span>
                    </div>

                    {/* Language Switcher */}
                    <div className="inline-flex bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                      <button
                        onClick={() => setActiveLang('hinglish')}
                        className={`px-2 py-0.5 rounded ${activeLang === 'hinglish' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
                      >
                        Hinglish
                      </button>
                      <button
                        onClick={() => setActiveLang('english')}
                        className={`px-2 py-0.5 rounded ${activeLang === 'english' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => setActiveLang('hindi')}
                        className={`px-2 py-0.5 rounded ${activeLang === 'hindi' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
                      >
                        हिन्दी
                      </button>
                    </div>
                  </div>

                  {/* AI Explanation Paragraph */}
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-3 font-normal">
                    {activeLang === 'hinglish' && currentSnippet.hinglish}
                    {activeLang === 'english' && currentSnippet.english}
                    {activeLang === 'hindi' && currentSnippet.hindi}
                  </p>

                  <div className="text-[10px] font-mono text-slate-400 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between mb-3">
                    <span className="text-emerald-700 font-semibold font-sans">✓ Verified Textbook:</span>
                    <span>{currentSnippet.source}</span>
                  </div>
                </div>

                {/* 4 Clean Utility Interactive Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <div className="p-2 bg-slate-50 rounded-lg text-[10px] font-bold text-center border border-slate-100 text-slate-700 hover:bg-slate-100 cursor-pointer">
                    Explain Simply
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg text-[10px] font-bold text-center border border-slate-100 text-slate-700 hover:bg-slate-100 cursor-pointer">
                    Practice Me
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg text-[10px] font-bold text-center border border-slate-100 text-slate-700 hover:bg-slate-100 cursor-pointer">
                    Check My Answer
                  </div>
                  <button 
                    onClick={onOpenStudentLogin}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold text-center transition-colors cursor-pointer"
                  >
                    Ask a Doubt
                  </button>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
