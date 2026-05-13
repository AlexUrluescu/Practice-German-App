import { UserProgress, WordProgress, VerbProgress, DailyActivity } from '../data/types';

const STORAGE_KEY = 'deutsch-lernen-progress';

const defaultProgress: UserProgress = {
  totalXP: 0,
  level: 1,
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: '',
  hearts: 5,
  wordsLearned: [],
  verbsLearned: [],
  dailyActivity: [],
  achievements: [],
};

export function getProgress(): UserProgress {
  if (typeof window === 'undefined') return defaultProgress;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultProgress;
    return JSON.parse(stored) as UserProgress;
  } catch {
    return defaultProgress;
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function addXP(amount: number): UserProgress {
  const progress = getProgress();
  progress.totalXP += amount;
  progress.level = Math.floor(progress.totalXP / 100) + 1;

  const today = new Date().toISOString().split('T')[0];
  const existingDay = progress.dailyActivity.find(d => d.date === today);
  if (existingDay) {
    existingDay.xpEarned += amount;
    existingDay.lessonsCompleted += 1;
  } else {
    progress.dailyActivity.push({ date: today, xpEarned: amount, lessonsCompleted: 1 });
  }

  // Update streak
  if (progress.lastActiveDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (progress.lastActiveDate === yesterdayStr) {
      progress.currentStreak += 1;
    } else if (progress.lastActiveDate !== today) {
      progress.currentStreak = 1;
    }
    progress.longestStreak = Math.max(progress.longestStreak, progress.currentStreak);
    progress.lastActiveDate = today;
  }

  saveProgress(progress);
  return progress;
}

export function updateWordProgress(wordId: string, domainId: string, correct: boolean): UserProgress {
  const progress = getProgress();
  let wp = progress.wordsLearned.find(w => w.wordId === wordId);

  if (!wp) {
    wp = {
      wordId,
      domainId,
      correctCount: 0,
      incorrectCount: 0,
      lastPracticed: new Date().toISOString(),
      nextReview: new Date().toISOString(),
      mastered: false,
    };
    progress.wordsLearned.push(wp);
  }

  if (correct) {
    wp.correctCount += 1;
  } else {
    wp.incorrectCount += 1;
  }

  wp.lastPracticed = new Date().toISOString();
  wp.mastered = wp.correctCount >= 5 && wp.correctCount / (wp.correctCount + wp.incorrectCount) >= 0.8;

  // Spaced repetition: longer intervals for well-known words
  const hoursUntilNext = wp.mastered ? 168 : wp.correctCount >= 3 ? 48 : wp.correctCount >= 1 ? 12 : 1;
  const nextDate = new Date();
  nextDate.setHours(nextDate.getHours() + hoursUntilNext);
  wp.nextReview = nextDate.toISOString();

  saveProgress(progress);
  return progress;
}

export function updateVerbProgress(verbId: string, correct: boolean): UserProgress {
  const progress = getProgress();
  let vp = progress.verbsLearned.find(v => v.verbId === verbId);

  if (!vp) {
    vp = {
      verbId,
      correctCount: 0,
      incorrectCount: 0,
      lastPracticed: new Date().toISOString(),
      nextReview: new Date().toISOString(),
      mastered: false,
    };
    progress.verbsLearned.push(vp);
  }

  if (correct) {
    vp.correctCount += 1;
  } else {
    vp.incorrectCount += 1;
  }

  vp.lastPracticed = new Date().toISOString();
  vp.mastered = vp.correctCount >= 5 && vp.correctCount / (vp.correctCount + vp.incorrectCount) >= 0.8;

  saveProgress(progress);
  return progress;
}

export function getWordsLearnedInDomain(domainId: string): number {
  const progress = getProgress();
  return progress.wordsLearned.filter(w => w.domainId === domainId).length;
}

export function getMasteredWordsInDomain(domainId: string): number {
  const progress = getProgress();
  return progress.wordsLearned.filter(w => w.domainId === domainId && w.mastered).length;
}

export function getMasteredVerbsCount(): number {
  const progress = getProgress();
  return progress.verbsLearned.filter(v => v.mastered).length;
}

export function getLast30DaysActivity(): DailyActivity[] {
  const progress = getProgress();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const days: DailyActivity[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const activity = progress.dailyActivity.find(a => a.date === dateStr);
    days.push(activity || { date: dateStr, xpEarned: 0, lessonsCompleted: 0 });
  }
  return days;
}

export function resetProgress(): void {
  saveProgress(defaultProgress);
}

export function loseHeart(): UserProgress {
  const progress = getProgress();
  progress.hearts = Math.max(0, progress.hearts - 1);
  saveProgress(progress);
  return progress;
}

export function refillHearts(): UserProgress {
  const progress = getProgress();
  progress.hearts = 5;
  saveProgress(progress);
  return progress;
}
