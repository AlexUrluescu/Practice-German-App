'use client';
import { useEffect, useState } from 'react';
import { getProgress, getLast30DaysActivity, resetProgress } from '@/lib/progress';
import { UserProgress, DailyActivity } from '@/data/types';
import { vocabularyDomains } from '@/data/vocabulary';
import { irregularVerbs } from '@/data/irregular-verbs';
import styles from './page.module.css';

const LEVEL_TITLES = [
  'Anfänger', 'Lerner', 'Entdecker', 'Kenner', 'Experte',
  'Meister', 'Professor', 'Gelehrter', 'Guru', 'Legende',
];

export default function ProfilePage() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [activity, setActivity] = useState<DailyActivity[]>([]);
  const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    setProgress(getProgress());
    setActivity(getLast30DaysActivity());
  }, []);

  if (!progress) return null;

  const totalWords = vocabularyDomains.reduce((s, d) => s + d.words.length, 0);
  const totalVerbs = irregularVerbs.length;
  const masteredWords = progress.wordsLearned.filter(w => w.mastered).length;
  const masteredVerbs = progress.verbsLearned.filter(v => v.mastered).length;
  const levelTitle = LEVEL_TITLES[Math.min(Math.floor((progress.level - 1) / 5), LEVEL_TITLES.length - 1)];
  const xpToNext = 100 - (progress.totalXP % 100);

  const handleReset = () => {
    resetProgress();
    setProgress(getProgress());
    setActivity(getLast30DaysActivity());
    setShowReset(false);
  };

  return (
    <div className={styles.page}>
      {/* Profile Header */}
      <div className={styles.profileHeader}>
        <div className={styles.avatar}>
          <span className={styles.avatarEmoji}>🇩🇪</span>
          <div className={styles.levelBadge}>Lv.{progress.level}</div>
        </div>
        <div className={styles.profileInfo}>
          <h1 className={styles.profileName}>{levelTitle}</h1>
          <p className={styles.profileSub}>{xpToNext} XP to next level</p>
          <div className="progress-bar-container" style={{ maxWidth: 200, marginTop: 8 }}>
            <div className="progress-bar-fill" style={{ width: `${((progress.totalXP % 100) / 100) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`stagger-children ${styles.statsGrid}`}>
        <div className={`glass-card ${styles.statCard}`}>
          <span className={styles.statEmoji}>⚡</span>
          <span className={styles.statVal}>{progress.totalXP}</span>
          <span className={styles.statLbl}>Total XP</span>
        </div>
        <div className={`glass-card ${styles.statCard}`}>
          <span className={styles.statEmoji}>🔥</span>
          <span className={styles.statVal}>{progress.currentStreak}</span>
          <span className={styles.statLbl}>Current Streak</span>
        </div>
        <div className={`glass-card ${styles.statCard}`}>
          <span className={styles.statEmoji}>🏅</span>
          <span className={styles.statVal}>{progress.longestStreak}</span>
          <span className={styles.statLbl}>Best Streak</span>
        </div>
        <div className={`glass-card ${styles.statCard}`}>
          <span className={styles.statEmoji}>❤️</span>
          <span className={styles.statVal}>{progress.hearts}/5</span>
          <span className={styles.statLbl}>Hearts</span>
        </div>
      </div>

      {/* Learning Progress */}
      <div className={`glass-card ${styles.progressSection}`}>
        <h2 className={styles.sectionTitle}>Learning Progress</h2>

        <div className={styles.progressRow}>
          <div className={styles.progressLabel}>
            <span>📚 Words Learned</span>
            <span className={styles.progressCount}>{progress.wordsLearned.length} / {totalWords}</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${(progress.wordsLearned.length / totalWords) * 100}%` }} />
          </div>
        </div>

        <div className={styles.progressRow}>
          <div className={styles.progressLabel}>
            <span>⭐ Words Mastered</span>
            <span className={styles.progressCount}>{masteredWords} / {totalWords}</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${(masteredWords / totalWords) * 100}%`, background: 'linear-gradient(90deg, var(--gold), var(--orange))' }} />
          </div>
        </div>

        <div className={styles.progressRow}>
          <div className={styles.progressLabel}>
            <span>✏️ Verbs Practiced</span>
            <span className={styles.progressCount}>{progress.verbsLearned.length} / {totalVerbs}</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${(progress.verbsLearned.length / totalVerbs) * 100}%`, background: 'linear-gradient(90deg, var(--purple), var(--blue))' }} />
          </div>
        </div>

        <div className={styles.progressRow}>
          <div className={styles.progressLabel}>
            <span>🏆 Verbs Mastered</span>
            <span className={styles.progressCount}>{masteredVerbs} / {totalVerbs}</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${(masteredVerbs / totalVerbs) * 100}%`, background: 'linear-gradient(90deg, var(--gold), var(--orange))' }} />
          </div>
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className={`glass-card ${styles.activitySection}`}>
        <h2 className={styles.sectionTitle}>Last 30 Days</h2>
        <div className={styles.heatmap}>
          {activity.map((day, i) => {
            const intensity = day.xpEarned === 0 ? 0 : day.xpEarned < 20 ? 1 : day.xpEarned < 50 ? 2 : 3;
            const d = new Date(day.date);
            const label = `${d.getDate()}/${d.getMonth() + 1}`;
            return (
              <div
                key={i}
                className={`${styles.heatCell} ${styles[`heat${intensity}`]}`}
                title={`${label}: ${day.xpEarned} XP, ${day.lessonsCompleted} lessons`}
              />
            );
          })}
        </div>
        <div className={styles.heatLegend}>
          <span className={styles.legendLabel}>Less</span>
          <div className={`${styles.heatCell} ${styles.heat0}`} />
          <div className={`${styles.heatCell} ${styles.heat1}`} />
          <div className={`${styles.heatCell} ${styles.heat2}`} />
          <div className={`${styles.heatCell} ${styles.heat3}`} />
          <span className={styles.legendLabel}>More</span>
        </div>
      </div>

      {/* Domain Breakdown */}
      <div className={`glass-card ${styles.domainsSection}`}>
        <h2 className={styles.sectionTitle}>Domain Breakdown</h2>
        {vocabularyDomains.map(domain => {
          const learned = progress.wordsLearned.filter(w => w.domainId === domain.id).length;
          const pct = Math.round((learned / domain.words.length) * 100);
          return (
            <div key={domain.id} className={styles.domainRow}>
              <span className={styles.domainIcon}>{domain.icon}</span>
              <span className={styles.domainName}>{domain.name}</span>
              <div className={styles.domainBar}>
                <div className={styles.domainFill} style={{ width: `${pct}%`, background: domain.color }} />
              </div>
              <span className={styles.domainPct}>{pct}%</span>
            </div>
          );
        })}
      </div>

      {/* Reset */}
      <div className={styles.dangerZone}>
        {!showReset ? (
          <button className="btn btn-secondary btn-sm" onClick={() => setShowReset(true)}>
            Reset Progress
          </button>
        ) : (
          <div className={styles.resetConfirm}>
            <p>Are you sure? This cannot be undone.</p>
            <div className={styles.resetBtns}>
              <button className="btn btn-danger btn-sm" onClick={handleReset}>Yes, Reset</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowReset(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
