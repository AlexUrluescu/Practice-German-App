'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { irregularVerbs, verbPatterns } from '@/data/irregular-verbs';
import styles from './page.module.css';

export default function VerbsPage() {
  const [search, setSearch] = useState('');
  const [filterDiff, setFilterDiff] = useState<string>('all');
  const [filterPattern, setFilterPattern] = useState<string>('all');
  const [expandedVerb, setExpandedVerb] = useState<string | null>(null);
  const [selectedVerbs, setSelectedVerbs] = useState<Set<string>>(new Set());

  const toggleSelection = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newSet = new Set(selectedVerbs);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedVerbs(newSet);
  };

  const filtered = useMemo(() => {
    return irregularVerbs.filter(v => {
      const matchSearch = !search ||
        v.infinitive.toLowerCase().includes(search.toLowerCase()) ||
        v.english.toLowerCase().includes(search.toLowerCase());
      const matchDiff = filterDiff === 'all' || v.difficulty === filterDiff;
      const matchPattern = filterPattern === 'all' || v.pattern === filterPattern;
      return matchSearch && matchDiff && matchPattern;
    });
  }, [search, filterDiff, filterPattern]);

  const patternGroups = useMemo(() => {
    const groups: Record<string, number> = {};
    irregularVerbs.forEach(v => {
      groups[v.pattern] = (groups[v.pattern] || 0) + 1;
    });
    return groups;
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Irregular Verbs</h1>
          <p className={styles.subtitle}>{irregularVerbs.length} verbs to master</p>
        </div>
        <Link href="/verbs/practice" className="btn btn-primary">
          Practice 🎯
        </Link>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search verbs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className={styles.filterRow}>
          <select className={styles.filterSelect} value={filterDiff} onChange={(e) => setFilterDiff(e.target.value)}>
            <option value="all">All Levels</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
          </select>
          <select className={styles.filterSelect} value={filterPattern} onChange={(e) => setFilterPattern(e.target.value)}>
            <option value="all">All Patterns</option>
            {verbPatterns.map(p => (
              <option key={p.id} value={p.label}>{p.label} ({patternGroups[p.label] || 0})</option>
            ))}
          </select>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => setSelectedVerbs(selectedVerbs.size === filtered.length ? new Set() : new Set(filtered.map(v => v.id)))}
          >
            {selectedVerbs.size === filtered.length && filtered.length > 0 ? 'Deselect All' : 'Select All Filtered'}
          </button>
        </div>
      </div>

      {/* Verb List */}
      <div className={styles.verbList}>
        {filtered.map(verb => (
          <div
            key={verb.id}
            className={`${styles.verbCard} ${expandedVerb === verb.id ? styles.expanded : ''}`}
            onClick={() => setExpandedVerb(expandedVerb === verb.id ? null : verb.id)}
          >
            <div className={styles.verbMain}>
              <div className={styles.verbInfo}>
                <input 
                  type="checkbox" 
                  className={styles.verbCheckbox} 
                  checked={selectedVerbs.has(verb.id)} 
                  onChange={(e) => toggleSelection(e as any, verb.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <span className={styles.verbInfinitive}>{verb.infinitive}</span>
                <span className={styles.verbEnglish}>{verb.english}</span>
              </div>
              <div className={styles.verbMeta}>
                <span className={`badge badge-${verb.difficulty.toLowerCase()}`}>{verb.difficulty}</span>
                <span className={styles.verbPattern}>{verb.pattern}</span>
              </div>
            </div>

            {expandedVerb === verb.id && (
              <div className={styles.verbDetails}>
                <table className={styles.conjugationTable}>
                  <thead>
                    <tr>
                      <th>Form</th>
                      <th>Conjugation</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>ich (Präsens)</td><td><strong>{verb.presentIch}</strong></td></tr>
                    <tr><td>du (Präsens)</td><td><strong>{verb.presentDu}</strong></td></tr>
                    <tr><td>er/sie/es (Präsens)</td><td><strong>{verb.presentEr}</strong></td></tr>
                    <tr><td>wir (Präsens)</td><td><strong>{verb.presentWir}</strong></td></tr>
                    <tr><td>ihr (Präsens)</td><td><strong>{verb.presentIhr}</strong></td></tr>
                    <tr><td>sie/Sie (Präsens)</td><td><strong>{verb.presentSie}</strong></td></tr>
                    <tr><td>Präteritum</td><td><strong>{verb.praeteritum}</strong></td></tr>
                    <tr><td>Partizip II</td><td><strong>{verb.partizipII}</strong></td></tr>
                    <tr><td>Hilfsverb</td><td><strong>{verb.hilfsverb}</strong></td></tr>
                  </tbody>
                </table>
                <div className={styles.exampleBox}>
                  <p className={styles.exampleDE}>{verb.example}</p>
                  <p className={styles.exampleEN}>{verb.exampleTranslation}</p>
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className={styles.noResults}>No verbs match your filters.</p>
        )}
      </div>

      {selectedVerbs.size > 0 && (
        <div className={styles.floatingActionBar}>
          <span className={styles.selectionCount}>{selectedVerbs.size} verbs selected</span>
          <Link href={`/verbs/practice?ids=${Array.from(selectedVerbs).join(',')}`} className="btn btn-primary">
            Practice Selected
          </Link>
        </div>
      )}
    </div>
  );
}
