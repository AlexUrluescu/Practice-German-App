import { IrregularVerb } from './types';
import { irregularVerbs as verbs1 } from './irregular-verbs-1';
import { irregularVerbs2 as verbs2 } from './irregular-verbs-2';

export const irregularVerbs: IrregularVerb[] = [...verbs1, ...verbs2];

export const verbPatterns = [
  { id: 'e-i', label: 'e → i', description: 'Stem vowel changes from e to i in present tense', example: 'geben → gibt' },
  { id: 'e-ie', label: 'e → ie', description: 'Stem vowel changes from e to ie in present tense', example: 'sehen → sieht' },
  { id: 'a-ae', label: 'a → ä', description: 'Stem vowel changes from a to ä in present tense', example: 'fahren → fährt' },
  { id: 'ei-ie', label: 'ei → ie', description: 'Stem vowel changes from ei to ie in past tense', example: 'schreiben → schrieb' },
  { id: 'i-a-u', label: 'i → a → u', description: 'Three-way vowel change across tenses', example: 'trinken → trank → getrunken' },
  { id: 'ie-o', label: 'ie → o', description: 'Stem vowel changes from ie to o in past tense', example: 'fliegen → flog' },
  { id: 'anomalous', label: 'Anomalous', description: 'Highly irregular, must be memorized individually', example: 'sein → war → gewesen' },
  { id: 'mixed', label: 'Mixed', description: 'Vowel change + regular -te ending in past', example: 'bringen → brachte → gebracht' },
  { id: 'modal', label: 'Modal Verbs', description: 'Special verbs that modify other verbs', example: 'können → konnte → gekonnt' },
  { id: 'ei-i', label: 'ei → i', description: 'Stem vowel changes from ei to i in past tense', example: 'schneiden → schnitt' },
];
