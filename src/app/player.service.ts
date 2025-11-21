import { Injectable, signal } from '@angular/core';
import { Player } from './models';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private _players = signal<Player[]>([
    { id: 1, nickname: 'Knightmare', level: 15, assignedQuests: [1], completedQuests: [2], clanId: 1, avatar: '🤺' },
    { id: 2, nickname: 'Herbalist', level: 5, assignedQuests: [2], completedQuests: [], avatar: '🌿' },
    { id: 3, nickname: 'TreasureHunter', level: 12, assignedQuests: [3], completedQuests: [], clanId: 2, avatar: '💎' },
  ]);

  private readonly AVATAR_OPTIONS = ['🤺', '🌿', '💎', '🐉', '⚔️', '🎯', '👑', '🧙', '🏹', '⚡'];

  players = () => this._players();

  getPlayers(): Player[] {
    return this._players();
  }

  getPlayerById(id: number): Player | undefined {
    return this._players().find(p => p.id === id);
  }

  addPlayer(p: Partial<Player>): Player {
    const list = this._players();
    const maxId = list.length ? Math.max(...list.map(x => x.id)) : 0;
    const newP: Player = {
      id: maxId + 1,
      nickname: p.nickname ?? `Player ${maxId + 1}`,
      level: p.level ?? 1,
      assignedQuests: p.assignedQuests ?? [],
      completedQuests: p.completedQuests ?? [],
      clanId: p.clanId,
      avatar: p.avatar ?? this.AVATAR_OPTIONS[0],
    };
    this._players.set([...list, newP]);
    return newP;
  }

  deletePlayer(id: number) {
    this._players.set(this._players().filter(p => p.id !== id));
  }

  setPlayerClan(playerId: number, clanId?: number) {
    this._players.set(this._players().map(p => p.id === playerId ? { ...p, clanId } : p));
  }

  assignQuest(playerId: number, questId: number) {
    this._players.set(this._players().map(p => {
      if (p.id === playerId && !p.assignedQuests.includes(questId)) {
        return { ...p, assignedQuests: [...p.assignedQuests, questId] };
      }
      return p;
    }));
  }

  completeQuest(playerId: number, questId: number) {
    this._players.set(this._players().map(p => {
      if (p.id === playerId && p.assignedQuests.includes(questId)) {
        return {
          ...p,
          assignedQuests: p.assignedQuests.filter(q => q !== questId),
          completedQuests: [...p.completedQuests, questId],
        };
      }
      return p;
    }));
  }

  uncompleteQuest(playerId: number, questId: number) {
    this._players.set(this._players().map(p => {
      if (p.id === playerId && p.completedQuests.includes(questId)) {
        return {
          ...p,
          completedQuests: p.completedQuests.filter(q => q !== questId),
          assignedQuests: [...p.assignedQuests, questId],
        };
      }
      return p;
    }));
  }

  getAvatarOptions(): string[] {
    return this.AVATAR_OPTIONS;
  }
}
