'use client';
import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { vocabularyDomains } from '@/data/vocabulary';
import { VocabularyWord } from '@/data/types';
import { addXP, updateWordProgress, loseHeart, getProgress } from '@/lib/progress';
import styles from './page.module.css';

type Mode = 'select' | 'flashcards' | 'quiz' | 'complete';

interface QuizState {
  currentIndex: number;
  score: number;
  answers: boolean[];
  selectedAnswer: string | null;
  showResult: boolean;
  hearts: number;
}

export default function DomainPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain: domainId } = use(params);
  const router = useRouter();
  const domainData = vocabularyDomains.find(d => d.id === domainId);

  const [mode, setMode] = useState<Mode>('select');
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [quiz, setQuiz] = useState<QuizState>({
    currentIndex: 0, score: 0, answers: [],
    selectedAnswer: null, showResult: false, hearts: 5,
  });
  const [inputAnswer, setInputAnswer] = useState('');
  const [quizType, setQuizType] = useState<'choice' | 'type-en' | 'type-de'>('choice');
  const [totalXPEarned, setTotalXPEarned] = useState(0);
  const [animClass, setAnimClass] = useState('');

  useEffect(() => {
    if (domainData) {
      const shuffled = [...domainData.words].sort(() => Math.random() - 0.5);
      setWords(shuffled.slice(0, 10));
    }
    const p = getProgress();
    setQuiz(prev => ({ ...prev, hearts: p.hearts }));
  }, [domainData]);

  const startFlashcards = () => { setMode('flashcards'); setFlashcardIndex(0); setIsFlipped(false); };
  const startQuiz = (type: 'choice' | 'type-en' | 'type-de') => {
    setQuizType(type);
    setMode('quiz');
    setQuiz({ currentIndex: 0, score: 0, answers: [], selectedAnswer: null, showResult: false, hearts: getProgress().hearts });
    setInputAnswer('');
  };

  const getOptions = useCallback((correct: VocabularyWord) => {
    if (!domainData) return [correct.english];
    const others = domainData.words.filter(w => w.id !== correct.id).sort(() => Math.random() - 0.5).slice(0, 3);
    const opts = [correct.english, ...others.map(w => w.english)].sort(() => Math.random() - 0.5);
    return opts;
  }, [domainData]);

  const handleAnswer = (answer: string) => {
    if (quiz.showResult) return;
    const currentWord = words[quiz.currentIndex];
    
    const expectedAnswer = quizType === 'type-de' 
      ? (currentWord.article ? `${currentWord.article} ${currentWord.german}` : currentWord.german)
      : currentWord.english;

    const isCorrect = answer.toLowerCase().trim() === expectedAnswer.toLowerCase().trim();

    setQuiz(prev => ({ ...prev, selectedAnswer: answer, showResult: true }));
    setAnimClass(isCorrect ? 'animate-bounce' : 'animate-shake');

    updateWordProgress(currentWord.id, domainId, isCorrect);

    if (isCorrect) {
      const xp = 10;
      addXP(xp);
      setTotalXPEarned(prev => prev + xp);
      setQuiz(prev => ({ ...prev, score: prev.score + 1, answers: [...prev.answers, true] }));
    } else {
      loseHeart();
      setQuiz(prev => ({ ...prev, hearts: prev.hearts - 1, answers: [...prev.answers, false] }));
    }

    setTimeout(() => {
      setAnimClass('');
      if (quiz.currentIndex + 1 >= words.length || (quiz.hearts <= 1 && !isCorrect)) {
        setMode('complete');
      } else {
        setQuiz(prev => ({ ...prev, currentIndex: prev.currentIndex + 1, selectedAnswer: null, showResult: false }));
        setInputAnswer('');
      }
    }, 1500);
  };

  if (!domainData) {
    return (
      <div className={styles.notFound}>
        <h1>Domain not found</h1>
        <button className="btn btn-primary" onClick={() => router.push('/vocabulary')}>Back to Vocabulary</button>
      </div>
    );
  }

  // MODE SELECT
  if (mode === 'select') {
    return (
      <div className={styles.page}>
        <button className={styles.backBtn} onClick={() => router.push('/vocabulary')}>← Back</button>
        <div className={styles.domainHeader} style={{ '--domain-color': domainData.color } as React.CSSProperties}>
          <span className={styles.domainIcon}>{domainData.icon}</span>
          <div>
            <h1 className={styles.domainTitle}>{domainData.name}</h1>
            <p className={styles.domainDesc}>{domainData.description}</p>
          </div>
        </div>

        <div className={styles.modeGrid}>
          <button className={`glass-card ${styles.modeCard}`} onClick={startFlashcards}>
            <span className={styles.modeIcon}>🃏</span>
            <h2 className={styles.modeTitle}>Flashcards</h2>
            <p className={styles.modeDesc}>Flip cards to learn German ↔ English</p>
          </button>
          <button className={`glass-card ${styles.modeCard}`} onClick={() => startQuiz('choice')}>
            <span className={styles.modeIcon}>🎯</span>
            <h2 className={styles.modeTitle}>Multiple Choice</h2>
            <p className={styles.modeDesc}>Pick the correct English translation</p>
          </button>
          <button className={`glass-card ${styles.modeCard}`} onClick={() => startQuiz('type-en')}>
            <span className={styles.modeIcon}>⌨️</span>
            <h2 className={styles.modeTitle}>Type in English</h2>
            <p className={styles.modeDesc}>Translate German words to English</p>
          </button>
          <button className={`glass-card ${styles.modeCard}`} onClick={() => startQuiz('type-de')}>
            <span className={styles.modeIcon}>🇩🇪</span>
            <h2 className={styles.modeTitle}>Type in German</h2>
            <p className={styles.modeDesc}>Translate English words to German</p>
          </button>
        </div>
      </div>
    );
  }

  // FLASHCARDS MODE
  if (mode === 'flashcards') {
    const word = words[flashcardIndex];
    return (
      <div className={styles.page}>
        <div className={styles.lessonHeader}>
          <button className={styles.backBtn} onClick={() => setMode('select')}>✕</button>
          <div className="progress-bar-container" style={{ flex: 1 }}>
            <div className="progress-bar-fill" style={{ width: `${((flashcardIndex + 1) / words.length) * 100}%` }} />
          </div>
          <span className={styles.counter}>{flashcardIndex + 1}/{words.length}</span>
        </div>

        <div className={styles.flashcardContainer} onClick={() => setIsFlipped(!isFlipped)}>
          <div className={`${styles.flashcard} ${isFlipped ? styles.flipped : ''}`}>
            <div className={styles.flashcardFront}>
              {word.article && <span className={styles.article}>{word.article}</span>}
              <span className={styles.flashcardWord}>{word.german}</span>
              <span className={styles.flashcardHint}>Tap to flip</span>
            </div>
            <div className={styles.flashcardBack}>
              <span className={styles.flashcardWord}>{word.english}</span>
              <p className={styles.flashcardExample}>{word.example}</p>
              <p className={styles.flashcardExampleTr}>{word.exampleTranslation}</p>
            </div>
          </div>
        </div>

        <div className={styles.flashcardActions}>
          <button
            className="btn btn-secondary"
            disabled={flashcardIndex === 0}
            onClick={() => { setFlashcardIndex(prev => prev - 1); setIsFlipped(false); }}
          >
            ← Previous
          </button>
          {flashcardIndex < words.length - 1 ? (
            <button
              className="btn btn-primary"
              onClick={() => { setFlashcardIndex(prev => prev + 1); setIsFlipped(false); }}
            >
              Next →
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => startQuiz('choice')}>
              Start Quiz 🎯
            </button>
          )}
        </div>
      </div>
    );
  }

  // QUIZ MODE
  if (mode === 'quiz') {
    const word = words[quiz.currentIndex];
    const options = getOptions(word);
    
    const expectedAnswer = quizType === 'type-de' 
      ? (word.article ? `${word.article} ${word.german}` : word.german)
      : word.english;

    return (
      <div className={styles.page}>
        <div className={styles.lessonHeader}>
          <button className={styles.backBtn} onClick={() => setMode('select')}>✕</button>
          <div className="progress-bar-container" style={{ flex: 1 }}>
            <div className="progress-bar-fill" style={{ width: `${((quiz.currentIndex + 1) / words.length) * 100}%` }} />
          </div>
          <div className={styles.hearts}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={i < quiz.hearts ? styles.heartFull : styles.heartEmpty}>
                {i < quiz.hearts ? '❤️' : '🖤'}
              </span>
            ))}
          </div>
        </div>

        <div className={`${styles.quizContent} ${animClass}`}>
          <p className={styles.quizPrompt}>
            {quizType === 'type-de' ? 'How do you say this in German?' : 'What does this mean?'}
          </p>
          <div className={styles.quizWord}>
            {quizType === 'type-de' ? (
              <span>{word.english}</span>
            ) : (
              <>
                {word.article && <span className={styles.quizArticle}>{word.article}</span>}
                <span>{word.german}</span>
              </>
            )}
          </div>

          {quizType === 'choice' ? (
            <div className={styles.optionsGrid}>
              {options.map((opt, i) => {
                let optClass = styles.option;
                if (quiz.showResult) {
                  if (opt === word.english) optClass += ` ${styles.correct}`;
                  else if (opt === quiz.selectedAnswer) optClass += ` ${styles.wrong}`;
                }
                return (
                  <button
                    key={i}
                    className={optClass}
                    onClick={() => handleAnswer(opt)}
                    disabled={quiz.showResult}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className={styles.typeAnswer}>
              <input
                type="text"
                className={`${styles.answerInput} ${quiz.showResult ? (quiz.selectedAnswer?.toLowerCase().trim() === expectedAnswer.toLowerCase().trim() ? styles.inputCorrect : styles.inputWrong) : ''}`}
                placeholder={quizType === 'type-de' ? "Type the German translation (include article)..." : "Type the English translation..."}
                value={inputAnswer}
                onChange={(e) => setInputAnswer(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && inputAnswer.trim()) handleAnswer(inputAnswer); }}
                disabled={quiz.showResult}
                autoFocus
              />
              {!quiz.showResult && (
                <button
                  className="btn btn-primary"
                  onClick={() => inputAnswer.trim() && handleAnswer(inputAnswer)}
                  disabled={!inputAnswer.trim()}
                >
                  Check
                </button>
              )}
              {quiz.showResult && quiz.selectedAnswer?.toLowerCase().trim() !== expectedAnswer.toLowerCase().trim() && (
                <p className={styles.correctAnswer}>Correct: <strong>{expectedAnswer}</strong></p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // COMPLETE
  return (
    <div className={styles.completePage}>
      <div className={styles.completeContent}>
        <div className={styles.completeEmoji}>🎉</div>
        <h1 className={styles.completeTitle}>Lesson Complete!</h1>
        <div className={styles.completeStats}>
          <div className={styles.completeStat}>
            <span className={styles.completeStatValue}>{quiz.score}/{words.length}</span>
            <span className={styles.completeStatLabel}>Correct</span>
          </div>
          <div className={styles.completeStat}>
            <span className={styles.completeStatValue}>{Math.round((quiz.score / words.length) * 100)}%</span>
            <span className={styles.completeStatLabel}>Accuracy</span>
          </div>
          <div className={styles.completeStat}>
            <span className={styles.completeStatValue}>+{totalXPEarned}</span>
            <span className={styles.completeStatLabel}>XP Earned</span>
          </div>
        </div>
        <div className={styles.completeActions}>
          <button className="btn btn-primary btn-lg" onClick={() => { setMode('select'); setTotalXPEarned(0); }}>
            Practice Again
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => router.push('/vocabulary')}>
            Back to Domains
          </button>
        </div>
      </div>
    </div>
  );
}
