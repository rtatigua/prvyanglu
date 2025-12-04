import { Injectable, signal } from '@angular/core';
import { Player, Quest, Clan } from '../models';
import { playerLevels } from '../levels';
import { Observable, of, from } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private readonly API_URL = 'http://localhost:3000';
  private _apiAvailable = false;
  // ===== PRIVATE STATE =====
  private _players = signal<Player[]>([
    { id: 1, nickname: 'Knightmare', xp: 150, assignedQuests: [1], completedQuests: [2], clanId: 1, avatar: '🤺' },
    { id: 2, nickname: 'Herbalist', xp: 50, assignedQuests: [2], completedQuests: [], avatar: '🌿' },
    { id: 3, nickname: 'Vilgain', xp: 1, assignedQuests: [3], completedQuests: [], clanId: 2, avatar: '🎵' },
    { id: 4, nickname: 'Klokočovec', xp: 10000, assignedQuests: [3], completedQuests: [], clanId: 1, avatar: '🧃' },

  ]);
  
  private _quests: Quest[] = [
    { id: 1, title: 'Slay the Dragon', description: 'Defeat the beast in the cave.', xp: 120 },
    { id: 2, title: 'Collect Herbs', description: 'Gather 10 healing herbs.', xp: 40 },
    { id: 3, title: 'Find the Lost Treasure', description: 'Locate the treasure map.', xp: 200 },
  ];

  private _clans: Clan[] = [
    { id: 1, name: 'Fire Wolves', description: 'Hunters united by flame.', capacity: 5, members: [] },
    { id: 2, name: 'Shadow Foxes', description: 'Masters of stealth.', capacity: 4, members: [] },
  ];

  private readonly AVATAR_OPTIONS = ['🤺', '🌿', '💎', '🐉', '⚔️', '🎯', '👑', '🧙', '🏹', '⚡'];

  // ===== PUBLIC ACCESSORS =====
  players = () => this._players();

  constructor() {
    this.updateClanMembers();
    this.loadPlayersFromAPI();
  }

  private loadPlayersFromAPI() {
    // Try to load from json-server API using fetch
    fetch(`${this.API_URL}/players`)
      .then(res => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then((players: Player[]) => {
        if (players && players.length > 0) {
          this._players.set(players);
          this._apiAvailable = true;
          this.updateClanMembers();
        }
      })
      .catch(() => { /* leave in-memory data as fallback */ });
  }

  private updateClanMembers() {
    this._clans.forEach(clan => {
      clan.members = this._players().filter(p => p.clanId === clan.id);
    });
  }

  // ===== PLAYER METHODS =====
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
      xp: p.xp ?? 0,
      assignedQuests: p.assignedQuests ?? [],
      completedQuests: p.completedQuests ?? [],
      clanId: p.clanId,
      avatar: p.avatar ?? this.AVATAR_OPTIONS[0],
    };
    this._players.set([...list, newP]);
    this.updateClanMembers();
    return newP;
  }

  deletePlayer(id: number) {
    this._players.set(this._players().filter(p => p.id !== id));
    this.updateClanMembers();
  }

  setPlayerClan(playerId: number, clanId?: number) {
    this._players.set(this._players().map(p => p.id === playerId ? { ...p, clanId } : p));
    this.updateClanMembers();
  }

  // ===== QUEST METHODS =====
  getQuests(): Quest[] {
    return this._quests;
  }

  getQuestById(id: number): Quest | undefined {
    return this._quests.find(q => q.id === id);
  }

  assignQuestToPlayer(playerId: number, questId: number) {
    this._players.set(this._players().map(p => {
      if (p.id === playerId && !p.assignedQuests.includes(questId)) {
        return { ...p, assignedQuests: [...p.assignedQuests, questId] };
      }
      return p;
    }));
  }

  removeQuestFromPlayer(playerId: number, questId: number) {
    this._players.set(this._players().map(p => {
      if (p.id === playerId && p.assignedQuests.includes(questId)) {
        return { ...p, assignedQuests: p.assignedQuests.filter(q => q !== questId) };
      }
      return p;
    }));
  }

  completeQuest(playerId: number, questId: number, questXp: number) {
    this._players.set(this._players().map(p => {
      if (p.id === playerId && p.assignedQuests.includes(questId)) {
        let newXp = (p.xp || 0) + questXp;
        const maxLevelObj = playerLevels[playerLevels.length - 1];
        if (newXp > maxLevelObj.xpRequired) {
          newXp = maxLevelObj.xpRequired;
        }
        return {
          ...p,
          xp: newXp,
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

  // ===== CLAN METHODS =====
  getClans(): Clan[] {
    return this._clans;
  }

  getClanById(id: number): Clan | undefined {
    return this._clans.find(c => c.id === id);
  }

  removeMember(clanId: number, playerId: number): void {
    const clan = this._clans.find(c => c.id === clanId);
    if (clan) {
      clan.members = clan.members.filter(m => m.id !== playerId);
    }
  }

  // ===== ASYNC API METHODS =====
  addPlayerAsync(player: Partial<Player>): Observable<Player> {
    const newPlayer: Player = {
      id: 0,
      nickname: player.nickname ?? 'New Player',
      xp: player.xp ?? 0,
      assignedQuests: player.assignedQuests ?? [],
      completedQuests: player.completedQuests ?? [],
      clanId: player.clanId,
      avatar: player.avatar ?? this.AVATAR_OPTIONS[0],
    };

    if (this._apiAvailable) {
      return from(fetch(`${this.API_URL}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlayer)
      }).then(res => res.json() as Promise<Player>)).pipe(
        tap(created => {
          this._players.set([...this._players(), created]);
          this.updateClanMembers();
        }),
        catchError(() => of(this.addPlayer(player)))
      );
    }

    return of(this.addPlayer(player));
  }

  deletePlayerAsync(id: number): Observable<void> {
    if (this._apiAvailable) {
      return from(fetch(`${this.API_URL}/players/${id}`, { method: 'DELETE' }).then(() => undefined)).pipe(
        tap(() => {
          this.deletePlayer(id);
        }),
        catchError(() => {
          this.deletePlayer(id);
          return of(void 0);
        })
      );
    }
    this.deletePlayer(id);
    return of(void 0);
  }

  updatePlayerAsync(id: number, player: Partial<Player>): Observable<Player> {
    if (this._apiAvailable) {
      return from(fetch(`${this.API_URL}/players/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(player)
      }).then(res => res.json() as Promise<Player>)).pipe(
        tap(updated => {
          this._players.set(this._players().map(p => p.id === id ? updated : p));
          this.updateClanMembers();
        }),
        catchError(() => {
          const current = this.getPlayerById(id);
          if (current) {
            this._players.set(this._players().map(p => p.id === id ? { ...current, ...player } : p));
            this.updateClanMembers();
            return of({ ...current, ...player } as Player);
          }
          return of(current as unknown as Player);
        })
      );
    }
    const current = this.getPlayerById(id);
    if (current) {
      this._players.set(this._players().map(p => p.id === id ? { ...current, ...player } : p));
      this.updateClanMembers();
      return of({ ...current, ...player } as Player);
    }
    return of(current as unknown as Player);
  }

  // ===== UTILITY METHODS =====
  getAvatarOptions(): string[] {
    return this.AVATAR_OPTIONS;
  }
}
