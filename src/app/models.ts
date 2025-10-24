export type Quest = {
    id: number;
    title: string;
    description?: string;
    completed: boolean;
    xp: number;
    ownerPlayerId?: number; 
  };
  
  export type Player = {
    id: number;
    nickname: string;
    level: number;
    clanId?: number | null;
    avatarUrl?: string;
    questIds: number[]; 
  };
  
  export type Clan = {
    id: number;
    name: string;
    description?: string;
    capacity: number;
    avatarUrl?: string;
    memberIds: number[];
  };
  