import { Injectable, signal } from '@angular/core';

export type Player = {
  id: number;
  nickname: string;
  level: number;
  clanId?: number | null;
  avatarUrl?: string;
  questIds?: number[];
};

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private _players = signal<Player[]>([
    { id: 1, nickname: 'DragonSlayer', level: 10, clanId: 1, questIds: [1] },
    { id: 2, nickname: 'MoonShadow', level: 7, questIds: [2] },
    { id: 3, nickname: 'IronWolf', level: 5, clanId: null, questIds: [] },
  ]);

  players = () => this._players();

  getPlayers(): Player[] {
    return this._players();
  }

  getPlayerById(id: number): Player | undefined {
    return this._players().find(p => p.id === id);
  }

  addPlayer(partial: Partial<Player> = {}): Player {
    const current = this._players();
    const maxId = current.length ? Math.max(...current.map(p => p.id)) : 0;
    const newPlayer: Player = {
      id: maxId + 1,
      nickname: partial.nickname ?? `Player${maxId + 1}`,
      level: partial.level ?? 1,
      clanId: partial.clanId ?? undefined,
      avatarUrl: partial.avatarUrl,
      questIds: partial.questIds ?? []
    };
    this._players.set([...current, newPlayer]);
    return newPlayer;
  }

  deletePlayer(id: number) {
    this._players.set(this._players().filter(p => p.id !== id));
  }

  assignQuestToPlayer(playerId: number, questId: number) {
    this._players.set(this._players().map(p => p.id === playerId ? { ...p, questIds: Array.from(new Set([...(p.questIds||[]), questId])) } : p));
  }

  removeQuestFromPlayer(playerId: number, questId: number) {
    this._players.set(this._players().map(p => p.id === playerId ? { ...p, questIds: (p.questIds||[]).filter(q => q !== questId) } : p));
  }

  setPlayerClan(playerId: number, clanId?: number) {
    this._players.set(this._players().map(p => p.id === playerId ? { ...p, clanId } : p));
  }
}
