// src/app/data.service.ts
import { Injectable, signal } from '@angular/core';
import { Quest, Player, Clan } from './models';

@Injectable({ providedIn: 'root' })
export class DataService {
  // initial sample data
  private _quests = signal<Quest[]>([
    { id: 1, title: 'Find the Lost Sword', description: '...', completed: false, xp: 120, ownerPlayerId: 1 },
    { id: 2, title: 'Rescue the Villagers', description: '...', completed: true, xp: 60, ownerPlayerId: 2 },
  ]);

  private _players = signal<Player[]>([
    { id: 1, nickname: 'HeroA', level: 5, clanId: 1, avatarUrl: undefined, questIds: [1] },
    { id: 2, nickname: 'RangerB', level: 3, clanId: undefined, avatarUrl: undefined, questIds: [2] },
  ]);

  private _clans = signal<Clan[]>([
    { id: 1, name: 'StormRiders', description: '...', capacity: 10, memberIds: [1], avatarUrl: undefined }
  ]);

  // getters (signals exposed via functions)
  quests = () => this._quests();
  players = () => this._players();
  clans = () => this._clans();

  // CRUD for Quests
  addQuest(q: Quest) {
    this._quests.set([...this._quests(), q]);
    if (q.ownerPlayerId) this.assignQuestToPlayer(q.id, q.ownerPlayerId);
  }
  deleteQuest(id: number) {
    this._quests.set(this._quests().filter(q => q.id !== id));
    // cleanup in players
    this._players.set(this._players().map(p => ({ ...p, questIds: p.questIds.filter(qid => qid !== id) })));
  }
  getQuestById(id: number) { return this._quests().find(q => q.id === id); }

  // Players
  addPlayer(p: Partial<Player>) {
    const current = this._players();
    const maxId = Math.max(...current.map(x => x.id), 0);
    const newPlayer: Player = {
      id: maxId + 1,
      nickname: p.nickname ?? `Player${maxId + 1}`,
      level: p.level ?? 1,
      clanId: p.clanId ?? undefined,
      avatarUrl: p.avatarUrl,
      questIds: p.questIds ?? []
    };
    this._players.set([...current, newPlayer]);
    // if clanId present, add to clan members
    if (newPlayer.clanId) this.addPlayerToClan(newPlayer.id, newPlayer.clanId);
    return newPlayer;
  }
  deletePlayer(id: number) {
    // remove from clans
    this._clans.set(this._clans().map(c => ({ ...c, memberIds: c.memberIds.filter(mid => mid !== id) })));
    // remove player's quests? keep them but unset owner
    this._quests.set(this._quests().map(q => q.ownerPlayerId === id ? { ...q, ownerPlayerId: undefined } : q));
    this._players.set(this._players().filter(p => p.id !== id));
  }
  getPlayerById(id: number) { return this._players().find(p => p.id === id); }

  // Clans
  addClan(c: Partial<Clan>) {
    const current = this._clans();
    const maxId = Math.max(...current.map(x => x.id), 0);
    const newClan: Clan = {
      id: maxId + 1,
      name: c.name ?? `Clan${maxId + 1}`,
      description: c.description ?? '',
      capacity: c.capacity ?? 10,
      avatarUrl: c.avatarUrl,
      memberIds: c.memberIds ?? []
    };
    this._clans.set([...current, newClan]);
    // ensure players reflect membership
    newClan.memberIds.forEach(pid => this.setPlayerClan(pid, newClan.id));
    return newClan;
  }
  deleteClan(id: number) {
    // clear clanId from players
    this._players.set(this._players().map(p => p.clanId === id ? { ...p, clanId: undefined } : p));
    this._clans.set(this._clans().filter(c => c.id !== id));
  }
  getClanById(id: number) { return this._clans().find(c => c.id === id); }

  // helpers: add/remove player from clan
  addPlayerToClan(playerId: number, clanId: number) {
    const clan = this.getClanById(clanId);
    if (!clan) return false;
    if (clan.memberIds.length >= clan.capacity) return false;
    this._clans.set(this._clans().map(c => c.id === clanId ? { ...c, memberIds: [...c.memberIds, playerId] } : c));
    this.setPlayerClan(playerId, clanId);
    return true;
  }
  removePlayerFromClan(playerId: number, clanId: number) {
    this._clans.set(this._clans().map(c => c.id === clanId ? { ...c, memberIds: c.memberIds.filter(id => id !== playerId) } : c));
    this.setPlayerClan(playerId, undefined);
  }
  private setPlayerClan(playerId: number, clanId?: number) {
    this._players.set(this._players().map(p => p.id === playerId ? { ...p, clanId } : p));
  }

  // helpers for player quests
  assignQuestToPlayer(questId: number, playerId: number) {
    // set owner on quest
    this._quests.set(this._quests().map(q => q.id === questId ? { ...q, ownerPlayerId: playerId } : q));
    // add quest id to player
    this._players.set(this._players().map(p => p.id === playerId ? { ...p, questIds: Array.from(new Set([...p.questIds, questId])) } : p));
  }
  removeQuestFromPlayer(questId: number, playerId: number) {
    this._players.set(this._players().map(p => p.id === playerId ? { ...p, questIds: p.questIds.filter(id => id !== questId) } : p));
    this._quests.set(this._quests().map(q => q.id === questId ? { ...q, ownerPlayerId: undefined } : q));
  }
}
