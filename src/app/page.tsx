'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProgress, getLast30DaysActivity } from '@/lib/progress';
import { UserProgress, DailyActivity } from '@/data/types';
import { vocabularyDomains } from '@/data/vocabulary';
import { irregularVerbs } from '@/data/irregular-verbs';
import styles from './page.module.css';

export default function Dashboard() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [activity, setActivity] = useState<DailyActivity[]>([]);

  useEffect(() => {
    setProgress(getProgress());
    setActivity(getLast30DaysActivity());
  }, []);

  if (!progress) return null;

  const totalWords = vocabularyDomains.reduce((sum, d) => sum + d.words.length, 0);
  const totalVerbs = irregularVerbs.length;
  const wordsLearned = progress.wordsLearned.length;
  const verbsLearned = progress.verbsLearned.length;
  const todayXP = activity.find(a => a.date === new Date().toISOString().split('T')[0])?.xpEarned || 0;
  const dailyGoal = 50;
  const goalProgress = Math.min((todayXP / dailyGoal) * 100, 100);

  return (
    <div className={styles.dashboard}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Hallo! 👋
          </h1>
          <p className={styles.heroSubtitle}>
            Ready to learn some German today?
          </p>
        </div>
        <div className={styles.streakBadge}>
          <span className={styles.streakIcon}>🔥</span>
          <span className={styles.streakCount}>{progress.currentStreak}</span>
          <span className={styles.streakLabel}>day streak</span>
        </div>
      </section>

      {/* Daily Goal */}
      <section className={`glass-card ${styles.dailyGoal}`}>
        <div className={styles.goalHeader}>
          <h2 className={styles.goalTitle}>Daily Goal</h2>
          <span className={styles.goalXP}>{todayXP}/{dailyGoal} XP</span>
        </div>
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${goalProgress}%` }}
          />
        </div>
        {goalProgress >= 100 && (
          <p className={styles.goalComplete}>🎉 Daily goal complete!</p>
        )}
      </section>

      {/* Stats */}
      <section className={`stagger-children ${styles.stats}`}>
        <div className={`glass-card ${styles.statCard}`}>
          <span className={styles.statIcon}>⚡</span>
          <span className={styles.statValue}>{progress.totalXP}</span>
          <span className={styles.statLabel}>Total XP</span>
        </div>
        <div className={`glass-card ${styles.statCard}`}>
          <span className={styles.statIcon}>🏆</span>
          <span className={styles.statValue}>{progress.level}</span>
          <span className={styles.statLabel}>Level</span>
        </div>
        <div className={`glass-card ${styles.statCard}`}>
          <span className={styles.statIcon}>📚</span>
          <span className={styles.statValue}>{wordsLearned}/{totalWords}</span>
          <span className={styles.statLabel}>Words</span>
        </div>
        <div className={`glass-card ${styles.statCard}`}>
          <span className={styles.statIcon}>✏️</span>
          <span className={styles.statValue}>{verbsLearned}/{totalVerbs}</span>
          <span className={styles.statLabel}>Verbs</span>
        </div>
      </section>

      {/* Quick Actions */}
      <section className={styles.actions}>
        <Link href="/vocabulary" className={`btn btn-primary btn-lg ${styles.actionBtn}`}>
          📚 Learn Vocabulary
        </Link>
        <Link href="/verbs" className={`btn btn-secondary btn-lg ${styles.actionBtn}`}>
          ✏️ Practice Verbs
        </Link>
      </section>

      {/* Activity Chart */}
      <section className={`glass-card ${styles.activitySection}`}>
        <h2 className={styles.sectionTitle}>Last 30 Days</h2>
        <div className={styles.activityGrid}>
          {activity.map((day, i) => {
            const intensity = day.xpEarned === 0 ? 0 : day.xpEarned < 20 ? 1 : day.xpEarned < 50 ? 2 : 3;
            return (
              <div
                key={i}
                className={`${styles.activityCell} ${styles[`intensity${intensity}`]}`}
                title={`${day.date}: ${day.xpEarned} XP`}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
