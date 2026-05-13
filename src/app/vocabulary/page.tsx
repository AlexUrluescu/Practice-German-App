'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { vocabularyDomains } from '@/data/vocabulary';
import { getWordsLearnedInDomain } from '@/lib/progress';
import styles from './page.module.css';

export default function VocabularyPage() {
  const [domainProgress, setDomainProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    const progress: Record<string, number> = {};
    vocabularyDomains.forEach(d => {
      progress[d.id] = getWordsLearnedInDomain(d.id);
    });
    setDomainProgress(progress);
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Vocabulary</h1>
        <p className={styles.subtitle}>Choose a domain to start learning new words</p>
      </div>

      <div className={`stagger-children ${styles.grid}`}>
        {vocabularyDomains.map((domain) => {
          const learned = domainProgress[domain.id] || 0;
          const total = domain.words.length;
          const pct = Math.round((learned / total) * 100);
          return (
            <Link
              key={domain.id}
              href={`/vocabulary/${domain.id}`}
              className={styles.card}
              style={{ '--domain-color': domain.color } as React.CSSProperties}
            >
              <div className={styles.cardIcon}>{domain.icon}</div>
              <div className={styles.cardContent}>
                <h2 className={styles.cardTitle}>{domain.name}</h2>
                <p className={styles.cardDesc}>{domain.description}</p>
                <div className={styles.cardProgress}>
                  <div className={styles.progressTrack}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className={styles.progressText}>{learned}/{total}</span>
                </div>
              </div>
              <div className={styles.cardArrow}>→</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
