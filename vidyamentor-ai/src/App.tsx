/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { WhySection } from './components/WhySection';
import { PricingSection } from './components/PricingSection';
import { FreeEducationSection } from './components/FreeEducationSection';
import { HowItWorks } from './components/HowItWorks';
import { LearningFeatures } from './components/LearningFeatures';
import { AITutorSection } from './components/AITutorSection';
import { SafetySection } from './components/SafetySection';
import { SchoolSection } from './components/SchoolSection';
import { LoginSection } from './components/LoginSection';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';

// Modals
import { StudentLoginModal } from './components/Modals/StudentLoginModal';
import { AdminLoginModal } from './components/Modals/AdminLoginModal';
import { FreeEducationModal } from './components/Modals/FreeEducationModal';
import { SchoolEnquiryModal } from './components/Modals/SchoolEnquiryModal';
import { PlanSelectionModal } from './components/Modals/PlanSelectionModal';

import { PricingPlan } from './types';

export default function App() {
  // Modal states
  const [studentLoginOpen, setStudentLoginOpen] = useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [freeEducationOpen, setFreeEducationOpen] = useState(false);
  const [schoolEnquiryOpen, setSchoolEnquiryOpen] = useState(false);
  const [selectedPlanModal, setSelectedPlanModal] = useState<{
    plan: PricingPlan | null;
    cycle: 'monthly' | 'annual';
    isOpen: boolean;
  }>({
    plan: null,
    cycle: 'annual',
    isOpen: false,
  });

  const [activeClassForLogin, setActiveClassForLogin] = useState<string>('Class 10');

  // Modal Handlers
  const handleOpenStudentLogin = (className: string = 'Class 10') => {
    setActiveClassForLogin(className);
    setStudentLoginOpen(true);
  };

  const handleSelectPlan = (plan: PricingPlan, cycle: 'monthly' | 'annual') => {
    setSelectedPlanModal({
      plan,
      cycle,
      isOpen: true,
    });
  };

  const handleProceedFromPlanToLogin = (className: string) => {
    setSelectedPlanModal((prev) => ({ ...prev, isOpen: false }));
    handleOpenStudentLogin(className);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      
      {/* 1. Header / Navbar */}
      <Navbar
        onOpenStudentLogin={() => handleOpenStudentLogin('Class 10')}
        onOpenAdminLogin={() => setAdminLoginOpen(true)}
        onOpenFreeEducation={() => setFreeEducationOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        
        {/* 2. Hero Section */}
        <Hero
          onOpenStudentLogin={() => handleOpenStudentLogin('Class 10')}
          onSelectClass={(className) => handleOpenStudentLogin(className)}
        />

        {/* 3. Why VIDYAMENTOR AI */}
        <WhySection
          onOpenFreeEducation={() => setFreeEducationOpen(true)}
        />

        {/* 4. Pricing Section */}
        <PricingSection
          onSelectPlan={handleSelectPlan}
          onOpenFreeEducation={() => setFreeEducationOpen(true)}
        />

        {/* 5. Free Education Social Impact Section */}
        <FreeEducationSection
          onOpenFreeEducation={() => setFreeEducationOpen(true)}
        />

        {/* 6. How It Works (6 Steps) */}
        <HowItWorks
          onOpenStudentLogin={() => handleOpenStudentLogin('Class 10')}
        />

        {/* 7. Learning Features (12 Cards) */}
        <LearningFeatures
          onOpenStudentLogin={() => handleOpenStudentLogin('Class 10')}
        />

        {/* 8. AI Tutor Section (Ask VIDYAMENTOR AI Sandbox) */}
        <AITutorSection
          onOpenStudentLogin={() => handleOpenStudentLogin('Class 10')}
        />

        {/* 9. Safety Section (5 Rules) */}
        <SafetySection />

        {/* 10. School Section (Are You a School?) */}
        <SchoolSection
          onOpenSchoolEnquiry={() => setSchoolEnquiryOpen(true)}
        />

        {/* 11. Login Section (Student Login + Admin Login Cards) */}
        <LoginSection
          onOpenStudentLogin={() => handleOpenStudentLogin('Class 10')}
          onOpenAdminLogin={() => setAdminLoginOpen(true)}
        />

        {/* 12. FAQ Section */}
        <FAQSection
          onOpenFreeEducation={() => setFreeEducationOpen(true)}
          onOpenSchoolEnquiry={() => setSchoolEnquiryOpen(true)}
        />

      </main>

      {/* 13. Footer */}
      <Footer
        onOpenStudentLogin={() => handleOpenStudentLogin('Class 10')}
        onOpenAdminLogin={() => setAdminLoginOpen(true)}
        onOpenSchoolEnquiry={() => setSchoolEnquiryOpen(true)}
        onOpenFreeEducation={() => setFreeEducationOpen(true)}
      />

      {/* Modals & Dialogs */}
      <StudentLoginModal
        isOpen={studentLoginOpen}
        onClose={() => setStudentLoginOpen(false)}
        initialClass={activeClassForLogin}
      />

      <AdminLoginModal
        isOpen={adminLoginOpen}
        onClose={() => setAdminLoginOpen(false)}
      />

      <FreeEducationModal
        isOpen={freeEducationOpen}
        onClose={() => setFreeEducationOpen(false)}
      />

      <SchoolEnquiryModal
        isOpen={schoolEnquiryOpen}
        onClose={() => setSchoolEnquiryOpen(false)}
      />

      <PlanSelectionModal
        isOpen={selectedPlanModal.isOpen}
        onClose={() => setSelectedPlanModal((prev) => ({ ...prev, isOpen: false }))}
        plan={selectedPlanModal.plan}
        billingCycle={selectedPlanModal.cycle}
        onProceedToLogin={handleProceedFromPlanToLogin}
      />

    </div>
  );
}
