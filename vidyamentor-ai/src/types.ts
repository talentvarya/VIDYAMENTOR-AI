export interface PricingPlan {
  id: string;
  className: string;
  monthlyPrice: string;
  annualPrice: string;
  isCombo?: boolean;
  comboDuration?: string;
  isBestValue?: boolean;
  buttonText: string;
  popularFor?: string;
  features: string[];
}

export interface LearningFeature {
  id: string;
  title: string;
  description: string;
  category: 'ai' | 'study' | 'tests' | 'tracking';
  icon: string;
  badge?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface AITutorSample {
  id: string;
  classLevel: string;
  subject: string;
  chapter: string;
  source: string;
  prompt: string;
  explanationEnglish: string;
  explanationHinglish: string;
  explanationHindi: string;
  practiceQuestions: string[];
  keyTakeaway: string;
}

export type SupportedLanguage = 'English' | 'Hinglish' | 'Hindi' | 'Tamil' | 'Telugu' | 'Marathi' | 'Bengali' | 'Gujarati';

export type ModalType = 'student-login' | 'admin-login' | 'free-education' | 'school-enquiry' | 'plan-checkout' | null;
