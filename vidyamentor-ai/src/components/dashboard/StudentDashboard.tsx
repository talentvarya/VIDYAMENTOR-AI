import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Bell,
  BookMarked,
  BookOpenCheck,
  Bookmark,
  Bot,
  Check,
  ChevronRight,
  Clock3,
  GraduationCap,
  Home,
  Languages,
  LogOut,
  Menu,
  Play,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import { fetchStudentCurriculum } from '../../lib/api';
import { loadProgress, saveProgress } from '../../lib/storage';
import { AuthSession, CurriculumChapter, CurriculumSubject, LearningProgress, StudentProfile } from '../../types';
import { DashboardTutor } from './DashboardTutor';

interface StudentDashboardProps {
  session: AuthSession & { profile: StudentProfile };
  onLogout: () => void;
}

type DashboardView = 'overview' | 'learn' | 'tutor' | 'progress';

const navigation = [
  { id: 'overview' as const, label: 'Overview', icon: Home },
  { id: 'learn' as const, label: 'Learn', icon: BookOpenCheck },
  { id: 'tutor' as const, label: 'AI Tutor', icon: Bot },
  { id: 'progress' as const, label: 'Progress', icon: BarChart3 },
];

const subjectStyles: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-700 border-blue-100',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  amber: 'bg-amber-50 text-amber-700 border-amber-100',
  violet: 'bg-violet-50 text-violet-700 border-violet-100',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  lime: 'bg-lime-50 text-lime-700 border-lime-100',
  rose: 'bg-rose-50 text-rose-700 border-rose-100',
};

const firstNameFromEmail = (email: string) => {
  const value = email.split('@')[0].replace(/[._-]+/g, ' ').trim();
  return value ? value.replace(/\b\w/g, (letter) => letter.toUpperCase()) : 'Learner';
};

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ session, onLogout }) => {
  const { profile } = session;
  const [subjects, setSubjects] = useState<CurriculumSubject[]>([]);
  const [curriculumLoading, setCurriculumLoading] = useState(true);
  const [curriculumError, setCurriculumError] = useState('');
  const allChapters = useMemo(() => subjects.flatMap((subject) => subject.chapters), [subjects]);
  const [view, setView] = useState<DashboardView>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id ?? '');
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [progress, setProgress] = useState<LearningProgress>(() => loadProgress(profile.email));

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId) ?? subjects[0];
  const selectedChapter = allChapters.find((chapter) => chapter.id === selectedChapterId) ?? null;
  const lastChapter = allChapters.find((chapter) => chapter.id === progress.lastChapterId) ?? allChapters[0];
  const completedCount = progress.completedChapterIds.filter((id) => allChapters.some((chapter) => chapter.id === id)).length;
  const completionPercent = allChapters.length ? Math.round((completedCount / allChapters.length) * 100) : 0;

  useEffect(() => {
    let mounted = true;
    setCurriculumLoading(true);
    void fetchStudentCurriculum(profile.classLevel, profile.board)
      .then((rows) => {
        if (!mounted) return;
        setSubjects(rows);
        setSelectedSubjectId(rows[0]?.id ?? '');
      })
      .catch((error) => { if (mounted) setCurriculumError(error instanceof Error ? error.message : 'Unable to load curriculum.'); })
      .finally(() => { if (mounted) setCurriculumLoading(false); });
    return () => { mounted = false; };
  }, [profile.board, profile.classLevel]);

  useEffect(() => {
    saveProgress(profile.email, progress);
  }, [profile.email, progress]);

  const navigate = (nextView: DashboardView) => {
    setView(nextView);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openChapter = (subject: CurriculumSubject, chapter: CurriculumChapter) => {
    setSelectedSubjectId(subject.id);
    setSelectedChapterId(chapter.id);
    setProgress((current) => ({ ...current, lastChapterId: chapter.id }));
    setView('learn');
  };

  const toggleComplete = (chapterId: string) => {
    setProgress((current) => ({
      ...current,
      lastChapterId: chapterId,
      completedChapterIds: current.completedChapterIds.includes(chapterId)
        ? current.completedChapterIds.filter((id) => id !== chapterId)
        : [...current.completedChapterIds, chapterId],
    }));
  };

  const toggleBookmark = (chapterId: string) => {
    setProgress((current) => ({
      ...current,
      bookmarkedChapterIds: current.bookmarkedChapterIds.includes(chapterId)
        ? current.bookmarkedChapterIds.filter((id) => id !== chapterId)
        : [...current.bookmarkedChapterIds, chapterId],
    }));
  };

  if (curriculumLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /></div>;
  }

  if (curriculumError || !subjects.length || !allChapters.length) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4"><div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-xl"><BookOpenCheck className="mx-auto h-10 w-10 text-blue-600" /><h1 className="mt-4 text-xl font-extrabold text-slate-900">Curriculum is being prepared</h1><p className="mt-2 text-sm leading-6 text-slate-500">{curriculumError || `No approved ${profile.board} ${profile.classLevel} lessons are published yet.`}</p><button onClick={onLogout} className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700"><LogOut className="h-4 w-4" /> Sign out</button></div></main>;
  }

  const renderNavigation = () => (
    <>
      <div className="flex h-20 items-center gap-3 border-b border-slate-200 px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <p className="font-extrabold tracking-tight text-slate-900">VIDYAMENTOR <span className="text-blue-600">AI</span></p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Student cockpit</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-4" aria-label="Student dashboard">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${active ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Icon className="h-4 w-4" /> {item.label}
            </button>
          );
        })}
      </nav>
      <div className="border-t border-slate-200 p-4">
        <div className="mb-3 rounded-xl bg-slate-50 p-3">
          <p className="truncate text-xs font-bold text-slate-800">{profile.email}</p>
          <p className="mt-1 text-[11px] font-semibold text-blue-600">{profile.classLevel} · {profile.languages.join(' + ')}</p>
        </div>
        <button onClick={onLogout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-500 transition hover:bg-red-50 hover:text-red-600">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        {renderNavigation()}
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-slate-900/50" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative flex h-full w-72 flex-col bg-white shadow-2xl">
            <button onClick={() => setMobileMenuOpen(false)} className="absolute right-3 top-3 z-10 rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
            {renderNavigation()}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs font-semibold text-slate-400">{profile.classLevel} learning space</p>
              <h1 className="text-base font-extrabold text-slate-900">{navigation.find((item) => item.id === view)?.label}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-blue-600" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-xs font-extrabold text-blue-700">
              {firstNameFromEmail(profile.email).slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          {view === 'overview' && (
            <div className="space-y-6">
              <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-lg shadow-blue-200 sm:p-8">
                <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10" />
                <div className="relative max-w-2xl">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold"><Sparkles className="h-3.5 w-3.5 text-amber-300" /> Your daily learning plan is ready</span>
                  <h2 className="mt-4 text-2xl font-extrabold sm:text-3xl">Welcome back, {firstNameFromEmail(profile.email)}!</h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">Continue your {profile.classLevel} syllabus with focused lessons, quick practice, and explanations in {profile.languages.join(' or ')}.</p>
                  <button onClick={() => openChapter(subjects.find((subject) => subject.chapters.some((item) => item.id === lastChapter.id)) ?? subjects[0], lastChapter)} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-blue-700 shadow-sm transition hover:bg-blue-50">
                    <Play className="h-4 w-4 fill-blue-700" /> Continue learning
                  </button>
                </div>
              </section>

              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: 'Syllabus progress', value: `${completionPercent}%`, icon: Target, color: 'text-blue-600 bg-blue-50' },
                  { label: 'Chapters complete', value: `${completedCount}/${allChapters.length}`, icon: BookOpenCheck, color: 'text-emerald-600 bg-emerald-50' },
                  { label: 'Saved for revision', value: String(progress.bookmarkedChapterIds.length), icon: Bookmark, color: 'text-violet-600 bg-violet-50' },
                  { label: 'Learning languages', value: '2 active', icon: Languages, color: 'text-amber-600 bg-amber-50' },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}><Icon className="h-5 w-5" /></div>
                      <p className="mt-4 text-2xl font-extrabold text-slate-900">{stat.value}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{stat.label}</p>
                    </div>
                  );
                })}
              </section>

              <section className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Today</p>
                      <h3 className="mt-1 text-lg font-extrabold text-slate-900">Your study plan</h3>
                    </div>
                    <Clock3 className="h-5 w-5 text-slate-400" />
                  </div>
                  <div className="mt-5 space-y-3">
                    {allChapters.slice(0, 3).map((item, index) => {
                      const subject = subjects.find((candidate) => candidate.chapters.some((chapterItem) => chapterItem.id === item.id)) ?? subjects[0];
                      const done = progress.completedChapterIds.includes(item.id);
                      return (
                        <button key={item.id} onClick={() => openChapter(subject, item)} className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50/50">
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{done ? <Check className="h-4 w-4" /> : index + 1}</span>
                          <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-slate-800">{item.title}</span><span className="text-xs text-slate-500">{subject.name} · {item.durationMinutes} min</span></span>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Bot className="h-5 w-5" /></div>
                    <div><p className="text-xs font-bold uppercase tracking-widest text-blue-600">24/7 support</p><h3 className="text-lg font-extrabold text-slate-900">Have a doubt?</h3></div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">Ask a curriculum-guarded question and receive a step-by-step explanation in either of your selected languages.</p>
                  <button onClick={() => navigate('tutor')} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800">Ask AI Tutor <ChevronRight className="h-4 w-4" /></button>
                </div>
              </section>
            </div>
          )}

          {view === 'learn' && (
            <div className="space-y-6">
              <section>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600">{profile.classLevel} syllabus</p>
                <h2 className="mt-1 text-2xl font-extrabold text-slate-900">Choose a subject</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {subjects.map((subject) => {
                    const active = subject.id === selectedSubject?.id;
                    return (
                      <button key={subject.id} onClick={() => { setSelectedSubjectId(subject.id); setSelectedChapterId(null); }} className={`rounded-2xl border p-4 text-left transition ${active ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100' : 'border-slate-200 bg-white hover:border-blue-200'}`}>
                        <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${subjectStyles[subject.color] ?? subjectStyles.blue}`}><BookMarked className="h-4 w-4" /></div>
                        <h3 className="mt-3 text-sm font-extrabold text-slate-900">{subject.name}</h3>
                        <p className="mt-1 text-xs text-slate-500">{subject.chapters.length} Phase 1 chapters</p>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="px-2 py-2 font-extrabold text-slate-900">{selectedSubject?.name} chapters</h3>
                  <div className="mt-2 space-y-2">
                    {selectedSubject?.chapters.map((chapter, index) => {
                      const active = selectedChapter?.id === chapter.id;
                      const done = progress.completedChapterIds.includes(chapter.id);
                      return (
                        <button key={chapter.id} onClick={() => openChapter(selectedSubject, chapter)} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${active ? 'border-blue-300 bg-blue-50' : 'border-transparent hover:bg-slate-50'}`}>
                          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold ${done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{done ? <Check className="h-4 w-4" /> : index + 1}</span>
                          <span className="min-w-0"><span className="block truncate text-sm font-bold text-slate-800">{chapter.title}</span><span className="text-xs text-slate-400">{chapter.durationMinutes} min lesson</span></span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                  {selectedChapter ? (
                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
                        <div>
                          <span className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-bold ${subjectStyles[selectedSubject.color] ?? subjectStyles.blue}`}>{selectedSubject.name}</span>
                          <h2 className="mt-3 text-2xl font-extrabold text-slate-900">{selectedChapter.title}</h2>
                          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{selectedChapter.description}</p>
                        </div>
                        <button onClick={() => toggleBookmark(selectedChapter.id)} className={`rounded-xl border p-3 transition ${progress.bookmarkedChapterIds.includes(selectedChapter.id) ? 'border-blue-200 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`} aria-label="Bookmark chapter">
                          <Bookmark className={`h-5 w-5 ${progress.bookmarkedChapterIds.includes(selectedChapter.id) ? 'fill-blue-600' : ''}`} />
                        </button>
                      </div>
                      <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                        <h3 className="font-extrabold text-slate-900">What you will master</h3>
                        <ul className="mt-3 space-y-2">
                          {selectedChapter.objectives.map((objective) => <li key={objective} className="flex items-start gap-2 text-sm text-slate-700"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><Check className="h-3 w-3" /></span>{objective}</li>)}
                        </ul>
                      </div>
                      <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
                        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Study path</p>
                        <p className="mt-2 text-sm leading-7 text-slate-700">Start with the core definition, connect it to one worked textbook example, and finish with a short self-check. Use the AI Tutor whenever a step is unclear.</p>
                      </div>
                      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <button onClick={() => toggleComplete(selectedChapter.id)} className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition ${progress.completedChapterIds.includes(selectedChapter.id) ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                          <Check className="h-4 w-4" /> {progress.completedChapterIds.includes(selectedChapter.id) ? 'Completed — mark incomplete' : 'Mark chapter complete'}
                        </button>
                        <button onClick={() => navigate('tutor')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"><Bot className="h-4 w-4 text-blue-600" /> Ask about this chapter</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex min-h-96 flex-col items-center justify-center text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><BookOpenCheck className="h-8 w-8" /></div>
                      <h2 className="mt-5 text-xl font-extrabold text-slate-900">Select a chapter to begin</h2>
                      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">Open a chapter from the left to see its objectives, study path, bookmark, and completion controls.</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {view === 'tutor' && <DashboardTutor token={session.token} profile={profile} subjects={subjects} initialSubject={selectedSubject} initialChapter={selectedChapter ?? undefined} />}

          {view === 'progress' && (
            <div className="space-y-6">
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                  <div><p className="text-xs font-bold uppercase tracking-widest text-blue-600">Learning report</p><h2 className="mt-1 text-2xl font-extrabold text-slate-900">Your {profile.classLevel} progress</h2><p className="mt-2 text-sm text-slate-500">Progress is saved on this device for the Phase 1 learning experience.</p></div>
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-[10px] border-blue-100 bg-blue-50 text-2xl font-extrabold text-blue-700">{completionPercent}%</div>
                </div>
              </section>
              <section className="grid gap-4 md:grid-cols-2">
                {subjects.map((subject) => {
                  const subjectCompleted = subject.chapters.filter((chapter) => progress.completedChapterIds.includes(chapter.id)).length;
                  const percent = Math.round((subjectCompleted / subject.chapters.length) * 100);
                  return (
                    <div key={subject.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between"><h3 className="font-extrabold text-slate-900">{subject.name}</h3><span className="text-sm font-bold text-blue-600">{percent}%</span></div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${percent}%` }} /></div>
                      <p className="mt-2 text-xs text-slate-500">{subjectCompleted} of {subject.chapters.length} chapters complete</p>
                    </div>
                  );
                })}
              </section>
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-2"><Bookmark className="h-5 w-5 text-blue-600" /><h3 className="text-lg font-extrabold text-slate-900">Saved for revision</h3></div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {progress.bookmarkedChapterIds.length ? progress.bookmarkedChapterIds.map((chapterId) => {
                    const chapter = allChapters.find((item) => item.id === chapterId);
                    const subject = subjects.find((item) => item.chapters.some((subjectChapter) => subjectChapter.id === chapterId));
                    if (!chapter || !subject) return null;
                    return <button key={chapterId} onClick={() => openChapter(subject, chapter)} className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-left hover:border-blue-200 hover:bg-blue-50"><span><span className="block text-sm font-bold text-slate-800">{chapter.title}</span><span className="text-xs text-slate-500">{subject.name}</span></span><ChevronRight className="h-4 w-4 text-slate-400" /></button>;
                  }) : <p className="col-span-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Bookmark a chapter from Learn to build your revision list.</p>}
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
