export interface Quest {
  id: string;
  title: string;
  description: string;
  xp: number;
  image?: string;
}

// 🔹 Hráč
export interface Player {
  id: string;
  nickname: string;
  xp: number;
  assignedQuests: string[]; // quest IDs not yet completed
  completedQuests: string[]; // quest IDs completed
  clanId?: string; // prepojenie na clan (only one clan per player)
  avatar?: string; // emoji or image URL
}

// 🔹 Clan
export interface Clan {
  id: string;
  name: string;
  description: string;
  capacity: number;
  members: Player[];
  image?: string;
}
