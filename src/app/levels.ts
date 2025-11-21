export interface PlayerLevel {
  level: number;
  xpRequired: number;
  title: string;
}

export const playerLevels: PlayerLevel[] = [
  { level: 1, xpRequired: 0, title: 'Novice' },
  { level: 2, xpRequired: 100, title: 'Apprentice' },
  { level: 3, xpRequired: 300, title: 'Adept' },
  { level: 4, xpRequired: 600, title: 'Expert' },
  { level: 5, xpRequired: 1000, title: 'Master' },
  { level: 6, xpRequired: 2000, title: 'Grandmaster' },
  { level: 7, xpRequired: 3500, title: 'Legend' },
  { level: 8, xpRequired: 5500, title: 'Mythic' },
  { level: 9, xpRequired: 8000, title: 'Immortal' },
  { level: 10, xpRequired: 12000, title: 'Eternal' }
];
