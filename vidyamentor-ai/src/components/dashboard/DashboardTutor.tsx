import React, { useState } from 'react';
import { Bot, BookOpen, Send, ShieldCheck, Sparkles } from 'lucide-react';
import { askTutor } from '../../lib/api';
import { CurriculumChapter, CurriculumSubject, StudentProfile } from '../../types';

interface DashboardTutorProps {
  token: string;
  profile: StudentProfile;
  subjects: CurriculumSubject[];
  initialSubject?: CurriculumSubject;
  initialChapter?: CurriculumChapter;
}

const promptIdeas = [
  'Explain this concept with a simple real-life example.',
  'Give me three board-style practice questions.',
  'What are the most common mistakes in this chapter?',
];

export const DashboardTutor: React.FC<DashboardTutorProps> = ({
  token,
  profile,
  subjects,
  initialSubject,
  initialChapter,
}) => {
  const [subjectId, setSubjectId] = useState(initialSubject?.id ?? subjects[0]?.id ?? '');
  const [chapterId, setChapterId] = useState(initialChapter?.id ?? '');
  const [language, setLanguage] = useState(profile.languages[0] ?? 'English');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedSubject = subjects.find((subject) => subject.id === subjectId) ?? subjects[0];
  const selectedChapter = selectedSubject?.chapters.find((chapter) => chapter.id === chapterId);

  const handleSubjectChange = (id: string) => {
    setSubjectId(id);
    setChapterId('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!question.trim() || !selectedSubject) return;
    setLoading(true);
    setError('');
    try {
      const result = await askTutor(token, {
        question: question.trim(),
        classLevel: profile.classLevel,
        subject: selectedSubject.name,
        language,
        chapter: selectedChapter?.title,
      });
      setAnswer(result.answer);
      setSource(result.sourceLabel);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'The AI Tutor is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-5 sm:px-7 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-100">Education-only AI</p>
              <h2 className="text-xl font-extrabold">Ask your VIDYAMENTOR</h2>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-7">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="space-y-1.5 text-xs font-bold text-slate-700">
              Subject
              <select
                value={selectedSubject?.id ?? ''}
                onChange={(event) => handleSubjectChange(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
              >
                {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
              </select>
            </label>
            <label className="space-y-1.5 text-xs font-bold text-slate-700">
              Chapter
              <select
                value={chapterId}
                onChange={(event) => setChapterId(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any chapter</option>
                {selectedSubject?.chapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.title}</option>)}
              </select>
            </label>
            <label className="space-y-1.5 text-xs font-bold text-slate-700">
              Explain in
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
              >
                {profile.languages.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
          </div>

          <label className="block space-y-1.5 text-xs font-bold text-slate-700">
            Your question
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask a concept doubt, request a step-by-step solution, or practice a board question…"
              maxLength={1200}
              rows={5}
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </label>

          {error && <div role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Send className="h-4 w-4" />}
            {loading ? 'Building your explanation…' : 'Ask AI Tutor'}
          </button>

          {answer && (
            <div className="space-y-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 sm:p-5" aria-live="polite">
              <div className="flex items-center gap-2 text-sm font-extrabold text-blue-900">
                <Sparkles className="h-4 w-4 text-blue-600" /> VIDYAMENTOR AI answer
              </div>
              <p className="whitespace-pre-line text-sm leading-7 text-slate-700">{answer}</p>
              <div className="flex items-center gap-1.5 border-t border-blue-100 pt-3 text-xs font-semibold text-slate-600">
                <BookOpen className="h-3.5 w-3.5 text-blue-600" /> Study scope: {source}
              </div>
            </div>
          )}
        </form>
      </section>

      <aside className="space-y-4">
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
          <ShieldCheck className="h-6 w-6 text-emerald-600" />
          <h3 className="mt-3 font-extrabold text-slate-900">Curriculum safety guard</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">Questions stay within Class 9–12 academics. Non-education and unsafe requests are blocked.</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <h3 className="font-extrabold text-slate-900">Try asking</h3>
          <div className="mt-3 space-y-2">
            {promptIdeas.map((idea) => (
              <button
                key={idea}
                type="button"
                onClick={() => setQuestion(idea)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-xs font-semibold leading-5 text-slate-700 transition hover:border-blue-200 hover:bg-blue-50"
              >
                {idea}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};
