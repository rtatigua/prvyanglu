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
  assignedQuests: number[]; // quest IDs not yet completed
  completedQuests: number[]; // quest IDs completed
  clanId?: number; // prepojenie na clan (only one clan per player)
  avatar?: string; // emoji or image URL
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
