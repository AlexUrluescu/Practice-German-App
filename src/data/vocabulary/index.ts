import { VocabularyDomain } from '../types';
import { foodWords } from './food';
import { homeWords } from './home';
import { familyWords } from './family';
import { travelWords } from './travel';
import { workWords } from './work';
import { healthWords } from './health';
import { clothingWords } from './clothing';
import { weatherWords } from './weather';
import { shoppingWords } from './shopping';
import { socialWords } from './social';
import { timeWords } from './time';
import { numbersWords } from './numbers';

export const vocabularyDomains: VocabularyDomain[] = [
  {
    id: 'food',
    name: 'Food & Drink',
    icon: '🍽️',
    description: 'Learn words about food, drinks, and cooking',
    color: '#FF6B6B',
    words: foodWords,
  },
  {
    id: 'home',
    name: 'Home & Living',
    icon: '🏠',
    description: 'Rooms, furniture, and household items',
    color: '#4ECDC4',
    words: homeWords,
  },
  {
    id: 'family',
    name: 'Family & People',
    icon: '👨‍👩‍👧‍👦',
    description: 'Family members, friends, and relationships',
    color: '#45B7D1',
    words: familyWords,
  },
  {
    id: 'travel',
    name: 'Travel & Transport',
    icon: '🚗',
    description: 'Vehicles, directions, and navigation',
    color: '#96CEB4',
    words: travelWords,
  },
  {
    id: 'work',
    name: 'Work & Education',
    icon: '💼',
    description: 'School, professions, and office life',
    color: '#FFEAA7',
    words: workWords,
  },
  {
    id: 'health',
    name: 'Body & Health',
    icon: '🏥',
    description: 'Body parts, health, and medical terms',
    color: '#DDA0DD',
    words: healthWords,
  },
  {
    id: 'clothing',
    name: 'Clothing',
    icon: '👕',
    description: 'Clothes, accessories, and fashion',
    color: '#F0E68C',
    words: clothingWords,
  },
  {
    id: 'weather',
    name: 'Weather & Nature',
    icon: '🌤️',
    description: 'Weather, seasons, and the natural world',
    color: '#87CEEB',
    words: weatherWords,
  },
  {
    id: 'shopping',
    name: 'Shopping & Money',
    icon: '🛒',
    description: 'Stores, prices, and transactions',
    color: '#98FB98',
    words: shoppingWords,
  },
  {
    id: 'social',
    name: 'Social & Leisure',
    icon: '🎉',
    description: 'Sports, hobbies, and entertainment',
    color: '#FFB347',
    words: socialWords,
  },
  {
    id: 'time',
    name: 'Time & Calendar',
    icon: '📅',
    description: 'Days, months, and telling time',
    color: '#C3B1E1',
    words: timeWords,
  },
  {
    id: 'numbers',
    name: 'Numbers & Colors',
    icon: '🔢',
    description: 'Counting and describing colors',
    color: '#FFD700',
    words: numbersWords,
  },
];
