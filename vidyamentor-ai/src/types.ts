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

export type AppRole = 'student' | 'school_admin' | 'super_admin';
export type StudentStatus =
  | 'created_draft'
  | 'pending_verification'
  | 'pending_payment'
  | 'pending_activation'
  | 'active_normal'
  | 'active_advanced'
  | 'suspended'
  | 'banned'
  | 'expired';
export type AdminWorkspace = 'normal' | 'advanced';

export type ModalType = 'student-login' | 'admin-login' | 'free-education' | 'school-enquiry' | 'plan-checkout' | null;

export interface StudentProfile {
  fullName: string;
  email: string;
  dateOfBirth: string;
  classLevel: string;
  board: string;
  studentId: string;
  schoolName: string;
  schoolCode?: string;
  section?: string;
  languages: [SupportedLanguage, SupportedLanguage];
}

export interface AuthSession {
  token: string;
  expiresAt: number;
  role: AppRole;
  schoolId: string | null;
  schoolName: string | null;
  schoolCode: string | null;
  workspace: AdminWorkspace;
  studentStatus: StudentStatus | null;
  canAccessLearning: boolean;
  profile: StudentProfile | null;
}

export interface AccessContext {
  userId: string;
  email: string;
  displayName: string | null;
  role: AppRole;
  schoolId: string | null;
  schoolName: string | null;
  schoolCode: string | null;
  workspace: AdminWorkspace;
  isEnabled: boolean;
  hasActiveDeviceSession: boolean;
  canAccessLearning: boolean;
  student: null | {
    fullName: string;
    dateOfBirth: string;
    classLevel: string;
    board: string;
    studentId: string;
    schoolName: string;
    section: string | null;
    language1: SupportedLanguage;
    language2: SupportedLanguage | null;
    status: StudentStatus;
    statusReason: string | null;
    expiresAt: string | null;
  };
}

export interface DeviceConflict {
  conflict: true;
  otherDeviceName?: string;
  lastSeenAt?: string;
}

export interface CurriculumChapter {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  objectives: string[];
}

export interface CurriculumSubject {
  id: string;
  name: string;
  color: string;
  chapters: CurriculumChapter[];
}

export interface LearningProgress {
  completedChapterIds: string[];
  bookmarkedChapterIds: string[];
  lastChapterId: string | null;
}
