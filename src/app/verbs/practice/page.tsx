'use client';
import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useMemo } from 'react';
import { irregularVerbs } from '@/data/irregular-verbs';
import { IrregularVerb } from '@/data/types';
import { addXP, updateVerbProgress, loseHeart, getProgress } from '@/lib/progress';
import styles from './page.module.css';

type ExerciseType = 'conjugation' | 'trio' | 'fill-gap' | 'translate';
type PracticeMode = 'select' | 'practice' | 'complete';

interface PracticeState {
  currentIndex: number;
  score: number;
  total: number;
  hearts: number;
  showResult: boolean;
  isCorrect: boolean | null;
  correctAnswer: string;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateConjugationQ(verb: IrregularVerb) {
  const forms = [
    { prompt: `ich (Präsens) — ${verb.infinitive}`, answer: verb.presentIch },
    { prompt: `du (Präsens) — ${verb.infinitive}`, answer: verb.presentDu },
    { prompt: `er/sie/es (Präsens) — ${verb.infinitive}`, answer: verb.presentEr },
    { prompt: `wir (Präsens) — ${verb.infinitive}`, answer: verb.presentWir },
    { prompt: `ihr (Präsens) — ${verb.infinitive}`, answer: verb.presentIhr },
    { prompt: `sie/Sie (Präsens) — ${verb.infinitive}`, answer: verb.presentSie },
    { prompt: `Präteritum — ${verb.infinitive}`, answer: verb.praeteritum },
    { prompt: `Partizip II — ${verb.infinitive}`, answer: verb.partizipII },
  ];
  return forms[Math.floor(Math.random() * forms.length)];
}

function generateTrioQ(verb: IrregularVerb) {
  const types = [
    { given: `Infinitiv: ${verb.infinitive}`, ask: 'Präteritum', answer: verb.praeteritum },
    { given: `Infinitiv: ${verb.infinitive}`, ask: 'Partizip II', answer: verb.partizipII },
    { given: `Präteritum: ${verb.praeteritum}`, ask: 'Infinitiv', answer: verb.infinitive },
    { given: `Partizip II: ${verb.partizipII}`, ask: 'Infinitiv', answer: verb.infinitive },
  ];
  return types[Math.floor(Math.random() * types.length)];
}

function generateFillGapQ(verb: IrregularVerb) {
  const sentence = verb.example;
  const forms = [verb.presentIch, verb.presentDu, verb.presentEr, verb.presentWir, verb.presentIhr, verb.presentSie, verb.infinitive];
  let answer = '';
  let gapped = sentence;

  for (const form of forms) {
    if (sentence.includes(form) && form.length > 2) {
      answer = form;
      gapped = sentence.replace(form, '______');
      break;
    }
  }

  if (!answer) {
    return { sentence: `______ = ${verb.english} (Infinitiv)`, answer: verb.infinitive };
  }

  return { sentence: gapped, answer };
}

function PracticeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idsParam = searchParams.get('ids');

  const availableVerbs = useMemo(() => {
    if (!idsParam) return irregularVerbs;
    const selectedIds = idsParam.split(',');
    const filtered = irregularVerbs.filter(v => selectedIds.includes(v.id));
    return filtered.length > 0 ? filtered : irregularVerbs;
  }, [idsParam]);

  const [mode, setMode] = useState<PracticeMode>('select');
  const [exerciseType, setExerciseType] = useState<ExerciseType>('conjugation');
  const [verbs, setVerbs] = useState<IrregularVerb[]>([]);
  const [userInput, setUserInput] = useState('');
  const [question, setQuestion] = useState<{ prompt: string; answer: string }>({ prompt: '', answer: '' });
  const [totalXP, setTotalXP] = useState(0);
  const [animClass, setAnimClass] = useState('');
  const [state, setState] = useState<PracticeState>({
    currentIndex: 0, score: 0, total: 15, hearts: 5,
    showResult: false, isCorrect: null, correctAnswer: '',
  });

  const loadQuestion = useCallback((verb: IrregularVerb, type: ExerciseType) => {
    if (type === 'conjugation') {
      const q = generateConjugationQ(verb);
      setQuestion({ prompt: q.prompt, answer: q.answer });
    } else if (type === 'trio') {
      const q = generateTrioQ(verb);
      setQuestion({ prompt: `${q.given}\n${q.ask} = ?`, answer: q.answer });
    } else if (type === 'fill-gap') {
      const q = generateFillGapQ(verb);
      setQuestion({ prompt: q.sentence, answer: q.answer });
    } else {
      setQuestion({ prompt: `How do you say:\n"${verb.english}"?`, answer: verb.infinitive });
    }
  }, []);

  const startPractice = (type: ExerciseType) => {
    setExerciseType(type);
    const shuffled = shuffleArray(availableVerbs).slice(0, 15);
    const sessionTotal = Math.min(15, availableVerbs.length);
    setVerbs(shuffled);
    const p = getProgress();
    setState({ currentIndex: 0, score: 0, total: sessionTotal, hearts: p.hearts, showResult: false, isCorrect: null, correctAnswer: '' });
    setUserInput('');
    setTotalXP(0);
    setMode('practice');
    loadQuestion(shuffled[0], type);
  };

  const checkAnswer = () => {
    if (!userInput.trim()) return;
    const correct = userInput.toLowerCase().trim() === question.answer.toLowerCase().trim();
    const verb = verbs[state.currentIndex];

    updateVerbProgress(verb.id, correct);
    setAnimClass(correct ? 'animate-bounce' : 'animate-shake');

    if (correct) {
      addXP(10);
      setTotalXP(prev => prev + 10);
    } else {
      loseHeart();
    }

    setState(prev => ({
      ...prev,
      showResult: true,
      isCorrect: correct,
      correctAnswer: question.answer,
      score: correct ? prev.score + 1 : prev.score,
      hearts: correct ? prev.hearts : prev.hearts - 1,
    }));

    setTimeout(() => {
      setAnimClass('');
      if (state.currentIndex + 1 >= state.total || (!correct && state.hearts <= 1)) {
        setMode('complete');
      } else {
        const nextIdx = state.currentIndex + 1;
        setState(prev => ({ ...prev, currentIndex: nextIdx, showResult: false, isCorrect: null, correctAnswer: '' }));
        setUserInput('');
        loadQuestion(verbs[nextIdx], exerciseType);
      }
    }, 2000);
  };

  if (mode === 'select') {
    return (
      <div className={styles.page}>
        <button className={styles.backBtn} onClick={() => router.push('/verbs')}>← Back</button>
        <h1 className={styles.title}>Choose Practice Mode</h1>
        <p className={styles.subtitle}>
          {idsParam ? `Practicing ${availableVerbs.length} selected verbs` : '15 verbs per session'}
        </p>

        <div className={styles.modeGrid}>
          <button className={`glass-card ${styles.modeCard}`} onClick={() => startPractice('conjugation')}>
            <span className={styles.modeEmoji}>📝</span>
            <h2>Conjugation Drill</h2>
            <p className={styles.modeDesc}>Type the correct conjugation for a given pronoun and tense</p>
          </button>
          <button className={`glass-card ${styles.modeCard}`} onClick={() => startPractice('trio')}>
            <span className={styles.modeEmoji}>🔗</span>
            <h2>Verb Trio</h2>
            <p className={styles.modeDesc}>Given one form, type the missing Infinitiv / Präteritum / Partizip II</p>
          </button>
          <button className={`glass-card ${styles.modeCard}`} onClick={() => startPractice('fill-gap')}>
            <span className={styles.modeEmoji}>✏️</span>
            <h2>Fill the Gap</h2>
            <p className={styles.modeDesc}>Complete sentences with the correct verb form</p>
          </button>
          <button className={`glass-card ${styles.modeCard}`} onClick={() => startPractice('translate')}>
            <span className={styles.modeEmoji}>🇩🇪</span>
            <h2>Translate to German</h2>
            <p className={styles.modeDesc}>Write the German Infinitiv for the English verb</p>
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'practice') {
    return (
      <div className={styles.page}>
        <div className={styles.lessonHeader}>
          <button className={styles.backBtn} onClick={() => setMode('select')}>✕</button>
          <div className="progress-bar-container" style={{ flex: 1 }}>
            <div className="progress-bar-fill" style={{ width: `${((state.currentIndex + 1) / state.total) * 100}%` }} />
          </div>
          <div className={styles.hearts}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i}>{i < state.hearts ? '❤️' : '🖤'}</span>
            ))}
          </div>
        </div>

        <div className={`${styles.practiceContent} ${animClass}`}>
          <div className={styles.verbBadge}>{verbs[state.currentIndex]?.infinitive} — {verbs[state.currentIndex]?.english}</div>

          <div className={styles.questionBox}>
            {question.prompt.split('\n').map((line, i) => (
              <p key={i} className={i === 0 ? styles.questionMain : styles.questionSub}>{line}</p>
            ))}
          </div>

          <div className={styles.answerArea}>
            <input
              type="text"
              className={`${styles.answerInput} ${state.showResult ? (state.isCorrect ? styles.inputCorrect : styles.inputWrong) : ''}`}
              placeholder="Type your answer..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') checkAnswer(); }}
              disabled={state.showResult}
              autoFocus
            />
            {!state.showResult && (
              <button className="btn btn-primary" onClick={checkAnswer} disabled={!userInput.trim()}>
                Check
              </button>
            )}
          </div>

          {state.showResult && (
            <div className={`${styles.feedback} ${state.isCorrect ? styles.feedbackCorrect : styles.feedbackWrong}`}>
              {state.isCorrect ? (
                <p>✅ Correct!</p>
              ) : (
                <p>❌ Wrong — the answer is: <strong>{state.correctAnswer}</strong></p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Complete
  return (
    <div className={styles.completePage}>
      <div className={styles.completeContent}>
        <div className={styles.completeEmoji}>🏆</div>
        <h1 className={styles.completeTitle}>Practice Complete!</h1>
        <div className={styles.completeStats}>
          <div className={styles.stat}>
            <span className={styles.statVal}>{state.score}/{state.total}</span>
            <span className={styles.statLbl}>Correct</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statVal}>{Math.round((state.score / state.total) * 100)}%</span>
            <span className={styles.statLbl}>Accuracy</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statVal}>+{totalXP}</span>
            <span className={styles.statLbl}>XP</span>
          </div>
        </div>
        <div className={styles.completeActions}>
          <button className="btn btn-primary btn-lg" onClick={() => setMode('select')}>Practice Again</button>
          <button className="btn btn-secondary btn-lg" onClick={() => router.push('/verbs')}>Back to Verbs</button>
        </div>
      </div>
    </div>
  );
}

export default function VerbPracticePage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '40px' }}>Loading practice mode...</div>}>
      <PracticeContent />
    </Suspense>
  );
}
