export interface Quest {
  id: number;
  title: string;
  description: string;
  xp: number;
  image?: string;
}

// 🔹 Hráč
export interface Player {
  id: number;
  nickname: string;
  level: number;
  quests: Quest[];
  clanId?: number; // prepojenie na clan
  avatar?: string;
}

// 🔹 Clan
export interface Clan {
  id: number;
  name: string;
  description: string;
  capacity: number;
  members: Player[];
  image?: string;
}
