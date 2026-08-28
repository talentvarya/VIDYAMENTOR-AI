/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
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
import { AccessPendingScreen, DeviceConflictScreen } from './components/dashboard/AccessGate';

// Modals
import { StudentLoginModal } from './components/Modals/StudentLoginModal';
import { AdminLoginModal } from './components/Modals/AdminLoginModal';
import { FreeEducationModal } from './components/Modals/FreeEducationModal';
import { SchoolEnquiryModal } from './components/Modals/SchoolEnquiryModal';
import { PlanSelectionModal } from './components/Modals/PlanSelectionModal';

import { AuthSession, PricingPlan } from './types';
import { finishAuthentication, restoreAuthSession, signOut } from './lib/api';
import { isSupabaseConfigured, supabase } from './lib/supabase';

const routeForRole = (role: AuthSession['role']) => role === 'student' ? '/dashboard' : role === 'school_admin' ? '/school-admin' : '/super-admin';
const StudentDashboard = React.lazy(() => import('./components/dashboard/StudentDashboard').then((module) => ({ default: module.StudentDashboard })));
const SchoolAdminWorkspace = React.lazy(() => import('./components/admin/SchoolAdminWorkspace').then((module) => ({ default: module.SchoolAdminWorkspace })));
const SuperAdminWorkspace = React.lazy(() => import('./components/admin/SuperAdminWorkspace').then((module) => ({ default: module.SuperAdminWorkspace })));
const workspaceFallback = <div className="flex min-h-screen items-center justify-center bg-slate-50"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" aria-label="Loading workspace" /></div>;

export default function App() {
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured);
  const [deviceConflict, setDeviceConflict] = useState(false);
  const [authError, setAuthError] = useState('');
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

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    void restoreAuthSession()
      .then((result) => {
        if (!mounted || !result) return;
        if (result.conflict) setDeviceConflict(true);
        else {
          setAuthSession(result.session);
          window.history.replaceState({}, '', routeForRole(result.session.role));
        }
      })
      .catch((error) => { if (mounted) setAuthError(error instanceof Error ? error.message : 'Unable to restore your session.'); })
      .finally(() => { if (mounted) setAuthLoading(false); });

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'SIGNED_OUT') {
        setAuthSession(null);
        setDeviceConflict(false);
      } else if (event === 'TOKEN_REFRESHED' && nextSession) {
        setAuthSession((current) => current ? {
          ...current,
          token: nextSession.access_token,
          expiresAt: (nextSession.expires_at ?? Math.floor(Date.now() / 1000) + 3600) * 1000,
        } : current);
      }
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (authLoading || authSession) return;
    if (window.location.pathname === '/dashboard') setStudentLoginOpen(true);
    if (['/school-admin', '/super-admin'].includes(window.location.pathname)) setAdminLoginOpen(true);
  }, [authLoading, authSession]);

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

  const handleAuthenticated = (session: AuthSession) => {
    setAuthSession(session);
    setDeviceConflict(false);
    setAuthError('');
    setStudentLoginOpen(false);
    setAdminLoginOpen(false);
    window.history.replaceState({}, '', routeForRole(session.role));
    window.scrollTo({ top: 0 });
  };

  const handleLogout = async () => {
    try { if (isSupabaseConfigured) await signOut(); } catch { /* Local state is still cleared. */ }
    setAuthSession(null);
    setDeviceConflict(false);
    window.history.replaceState({}, '', '/');
    window.scrollTo({ top: 0 });
  };

  const continueOnThisDevice = async () => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const result = await finishAuthentication(true);
      if (!result.session) throw new Error('Unable to replace the other session.');
      handleAuthenticated(result.session);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Unable to continue on this device.');
    } finally { setAuthLoading(false); }
  };

  if (authLoading) return <div className="flex min-h-screen items-center justify-center bg-slate-50"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" aria-label="Loading session" /></div>;
  if (deviceConflict) return <DeviceConflictScreen onContinue={() => void continueOnThisDevice()} onLogout={() => void handleLogout()} loading={authLoading} error={authError} />;
  if (authSession?.role === 'school_admin') return <React.Suspense fallback={workspaceFallback}><SchoolAdminWorkspace session={authSession} onLogout={() => void handleLogout()} /></React.Suspense>;
  if (authSession?.role === 'super_admin') return <React.Suspense fallback={workspaceFallback}><SuperAdminWorkspace session={authSession} onLogout={() => void handleLogout()} onSessionChange={setAuthSession} /></React.Suspense>;
  if (authSession?.role === 'student') {
    if (authSession.canAccessLearning && authSession.profile) return <React.Suspense fallback={workspaceFallback}><StudentDashboard session={{ ...authSession, profile: authSession.profile }} onLogout={() => void handleLogout()} /></React.Suspense>;
    return <AccessPendingScreen session={authSession} onLogout={() => void handleLogout()} />;
  }

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
        onAuthenticated={handleAuthenticated}
        initialClass={activeClassForLogin}
      />

      <AdminLoginModal
        isOpen={adminLoginOpen}
        onClose={() => setAdminLoginOpen(false)}
        onAuthenticated={handleAuthenticated}
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
