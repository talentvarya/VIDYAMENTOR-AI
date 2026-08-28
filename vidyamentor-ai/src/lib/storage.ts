import { LearningProgress } from '../types';

const PROGRESS_PREFIX = 'vidyamentor.phase1.progress';

const emptyProgress: LearningProgress = {
  completedChapterIds: [],
  bookmarkedChapterIds: [],
  lastChapterId: null,
};

const progressKey = (email: string) => `${PROGRESS_PREFIX}.${email.toLowerCase()}`;

export const loadProgress = (email: string): LearningProgress => {
  try {
    const raw = window.localStorage.getItem(progressKey(email));
    return raw ? { ...emptyProgress, ...(JSON.parse(raw) as LearningProgress) } : { ...emptyProgress };
  } catch {
    return { ...emptyProgress };
  }
};

export const saveProgress = (email: string, progress: LearningProgress) => {
  window.localStorage.setItem(progressKey(email), JSON.stringify(progress));
};
