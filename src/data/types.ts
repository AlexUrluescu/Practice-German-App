export interface VocabularyWord {
  id: string;
  german: string;
  english: string;
  article?: 'der' | 'die' | 'das';
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'other';
  example: string;
  exampleTranslation: string;
  difficulty: 'A1' | 'A2' | 'B1';
}

export interface VocabularyDomain {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  words: VocabularyWord[];
}

export interface IrregularVerb {
  id: string;
  infinitive: string;
  english: string;
  presentIch: string;
  presentDu: string;
  presentEr: string;
  presentWir: string;
  presentIhr: string;
  presentSie: string;
  praeteritum: string;
  partizipII: string;
  hilfsverb: 'haben' | 'sein';
  pattern: string;
  difficulty: 'A1' | 'A2' | 'B1';
  example: string;
  exampleTranslation: string;
}

export interface WordProgress {
  wordId: string;
  domainId: string;
  correctCount: number;
  incorrectCount: number;
  lastPracticed: string;
  nextReview: string;
  mastered: boolean;
}

export interface VerbProgress {
  verbId: string;
  correctCount: number;
  incorrectCount: number;
  lastPracticed: string;
  nextReview: string;
  mastered: boolean;
}

export interface DailyActivity {
  date: string;
  xpEarned: number;
  lessonsCompleted: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface UserProgress {
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  hearts: number;
  wordsLearned: WordProgress[];
  verbsLearned: VerbProgress[];
  dailyActivity: DailyActivity[];
  achievements: string[];
}

export type QuizType = 'multiple-choice' | 'fill-blank' | 'match' | 'conjugation' | 'verb-trio';

export interface QuizQuestion {
  type: QuizType;
  question: string;
  correctAnswer: string;
  options?: string[];
  hint?: string;
}

export interface LessonResult {
  totalQuestions: number;
  correctAnswers: number;
  xpEarned: number;
  newWordsLearned: number;
  accuracy: number;
  timeSpent: number;
}
