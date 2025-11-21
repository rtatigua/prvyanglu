import { Injectable, signal } from '@angular/core';
import { Player, Quest, Clan } from '../models';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private quests: Quest[] = [
    { id: 1, title: 'Slay the Dragon', description: 'Defeat the beast in the cave.', xp: 120 },
    { id: 2, title: 'Collect Herbs', description: 'Gather 10 healing herbs.', xp: 40 },
    { id: 3, title: 'Find the Lost Treasure', description: 'Locate the treasure map.', xp: 200 },
  ];

  private clans: Clan[] = [
    { id: 1, name: 'Fire Wolves', description: 'Hunters united by flame.', capacity: 5, members: [] },
    { id: 2, name: 'Shadow Foxes', description: 'Masters of stealth.', capacity: 4, members: [] },
  ];

  private playersSignal = signal<Player[]>([
    {
      id: 1,
      nickname: 'Knightmare',
      level: 15,
      assignedQuests: [1],
      completedQuests: [],
      clanId: 1,
      avatar: 'assets/avatars/knight.png',
    },
    {
      id: 2,
      nickname: 'Herbalist',
      level: 5,
      assignedQuests: [2],
      completedQuests: [],
      avatar: 'assets/avatars/herbalist.png',
    },
    {
      id: 3,
      nickname: 'TreasureHunter',
      level: 12,
      assignedQuests: [3],
      completedQuests: [],
      clanId: 2,
      avatar: 'assets/avatars/hunter.png',
    },
  ]);

  players$ = this.playersSignal.asReadonly();

  constructor() {
    this.updateClanMembers();
  }

  private updateClanMembers() {
    this.clans.forEach(clan => {
      clan.members = this.playersSignal().filter(p => p.clanId === clan.id);
    });
  }

  getPlayers(): Player[] {
    return this.playersSignal();
  }

  getPlayerById(id: number): Player | undefined {
    return this.playersSignal().find(p => p.id === id);
  }

  addPlayer(player: Player): void {
    const currentPlayers = this.playersSignal();
    this.playersSignal.set([...currentPlayers, player]);
    this.updateClanMembers();
  }

  removePlayer(id: number): void {
    const currentPlayers = this.playersSignal();
    this.playersSignal.set(currentPlayers.filter(p => p.id !== id));
    this.updateClanMembers();
  }

  updatePlayer(id: number, updatedPlayer: Partial<Player>): void {
    const currentPlayers = this.playersSignal();
    const playerIndex = currentPlayers.findIndex(p => p.id === id);
    if (playerIndex !== -1) {
      currentPlayers[playerIndex] = { ...currentPlayers[playerIndex], ...updatedPlayer };
      this.playersSignal.set([...currentPlayers]);
      this.updateClanMembers();
    }
  }

  getClans(): Clan[] {
    return this.clans;
  }

  getClanById(id: number): Clan | undefined {
    return this.clans.find(c => c.id === id);
  }

  getQuests(): Quest[] {
    return this.quests;
  }

  getQuestById(id: number): Quest | undefined {
    return this.quests.find(q => q.id === id);
  }

  assignQuestToPlayer(playerId: number, questId: number): void {
    const currentPlayers = this.playersSignal();
    const playerIndex = currentPlayers.findIndex(p => p.id === playerId);
    if (playerIndex !== -1) {
      const player = currentPlayers[playerIndex];
      if (!player.assignedQuests.includes(questId)) {
        player.assignedQuests.push(questId);
        this.playersSignal.set([...currentPlayers]);
      }
    }
  }

  removeQuestFromPlayer(playerId: number, questId: number): void {
    const currentPlayers = this.playersSignal();
    const playerIndex = currentPlayers.findIndex(p => p.id === playerId);
    if (playerIndex !== -1) {
      const player = currentPlayers[playerIndex];
      player.assignedQuests = player.assignedQuests.filter(q => q !== questId);
      this.playersSignal.set([...currentPlayers]);
    }
  }

  completeQuest(playerId: number, questId: number): void {
    const currentPlayers = this.playersSignal();
    const playerIndex = currentPlayers.findIndex(p => p.id === playerId);
    if (playerIndex !== -1) {
      const player = currentPlayers[playerIndex];
      player.assignedQuests = player.assignedQuests.filter(q => q !== questId);
      if (!player.completedQuests.includes(questId)) {
        player.completedQuests.push(questId);
      }
      this.playersSignal.set([...currentPlayers]);
    }
  }

  uncompleteQuest(playerId: number, questId: number): void {
    const currentPlayers = this.playersSignal();
    const playerIndex = currentPlayers.findIndex(p => p.id === playerId);
    if (playerIndex !== -1) {
      const player = currentPlayers[playerIndex];
      player.completedQuests = player.completedQuests.filter(q => q !== questId);
      if (!player.assignedQuests.includes(questId)) {
        player.assignedQuests.push(questId);
      }
      this.playersSignal.set([...currentPlayers]);
    }
  }
}