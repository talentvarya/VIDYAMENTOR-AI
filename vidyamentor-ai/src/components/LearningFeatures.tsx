import React, { useState } from 'react';
import { 
  Bot, 
  PlaySquare, 
  FileText, 
  Sparkles, 
  CheckSquare, 
  ClipboardList, 
  Timer, 
  AlertCircle, 
  BarChart3, 
  Calendar, 
  Users, 
  Bookmark,
  Layers,
  ArrowRight
} from 'lucide-react';
import { LEARNING_FEATURES } from '../data/content';

interface LearningFeaturesProps {
  onOpenStudentLogin: () => void;
}

export const LearningFeatures: React.FC<LearningFeaturesProps> = ({ onOpenStudentLogin }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'ai' | 'study' | 'tests' | 'tracking'>('all');

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Bot': return <Bot className="w-5 h-5" />;
      case 'PlaySquare': return <PlaySquare className="w-5 h-5" />;
      case 'FileText': return <FileText className="w-5 h-5" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      case 'CheckSquare': return <CheckSquare className="w-5 h-5" />;
      case 'ClipboardList': return <ClipboardList className="w-5 h-5" />;
      case 'Timer': return <Timer className="w-5 h-5" />;
      case 'AlertCircle': return <AlertCircle className="w-5 h-5" />;
      case 'BarChart3': return <BarChart3 className="w-5 h-5" />;
      case 'Calendar': return <Calendar className="w-5 h-5" />;
      case 'Users': return <Users className="w-5 h-5" />;
      case 'Bookmark': return <Bookmark className="w-5 h-5" />;
      default: return <Bot className="w-5 h-5" />;
    }
  };

  const filteredFeatures = selectedCategory === 'all'
    ? LEARNING_FEATURES
    : LEARNING_FEATURES.filter((f) => f.category === selectedCategory);

  return (
    <section id="features" className="py-12 sm:py-16 bg-[#F8FAFC] border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <span className="px-3.5 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-widest inline-flex items-center gap-1.5 mb-3">
            <Layers className="w-3.5 h-3.5" /> All-In-One High School Learning Suite
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Comprehensive Learning Features
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-3 leading-relaxed">
            Everything a student in Class 9, 10, 11, or 12 needs to understand complex concepts, practice questions, and score high in exams.
          </p>

          {/* Category Filter Chips */}
          <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All 12 Features
            </button>
            <button
              onClick={() => setSelectedCategory('ai')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedCategory === 'ai'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              AI & Doubt Mentorship
            </button>
            <button
              onClick={() => setSelectedCategory('study')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedCategory === 'study'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Study Notes & Videos
            </button>
            <button
              onClick={() => setSelectedCategory('tests')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedCategory === 'tests'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              MCQ & Mock Tests
            </button>
            <button
              onClick={() => setSelectedCategory('tracking')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedCategory === 'tracking'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Diagnostics & Progress
            </button>
          </div>
        </div>

        {/* 12 Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map((feat) => (
            <div
              key={feat.id}
              id={`feature-card-${feat.id}`}
              className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xs">
                    {getIcon(feat.icon)}
                  </div>
                  {feat.badge && (
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-2xs font-extrabold uppercase tracking-wide">
                      {feat.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {feat.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium capitalize text-2xs">
                  {feat.category === 'ai' ? 'AI Mentorship' : feat.category === 'study' ? 'Learning Materials' : feat.category === 'tests' ? 'Assessment' : 'Analytics'}
                </span>
                <span className="text-blue-600 font-bold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                  Explore <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-10 p-6 rounded-[1.5rem] bg-white border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="text-base font-bold text-slate-900">
              Ready to experience all 12 learning tools in action?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Available instantly across Class 9, 10, 11 and 12 dashboards.
            </p>
          </div>
          <button
            onClick={onOpenStudentLogin}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all shrink-0 cursor-pointer"
          >
            Start Learning Now
          </button>
        </div>

      </div>
    </section>
  );
};
