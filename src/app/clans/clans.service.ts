import { Injectable, signal } from '@angular/core';

export type Clan = {
  id: number;
  name: string;
  description: string;
  capacity: number;
  memberIds: number[];
  emblemUrl?: string;
};

@Injectable({ providedIn: 'root' })
export class ClanService {
  private _clans = signal<Clan[]>([
    { id: 1, name: 'Dragon Knights', description: 'Elite slayers of dragons', capacity: 10, memberIds: [1] },
    { id: 2, name: 'Moon Order', description: 'Secretive moonlight clan', capacity: 5, memberIds: [2] },
  ]);

  clans = () => this._clans();

  getClans(): Clan[] {
    return this._clans();
  }

  getClanById(id: number): Clan | undefined {
    return this._clans().find(c => c.id === id);
  }

  addClan(partial: Partial<Clan> = {}): Clan {
    const list = this._clans();
    const maxId = list.length ? Math.max(...list.map(c => c.id)) : 0;
    const newClan: Clan = {
      id: maxId + 1,
      name: partial.name ?? `Clan ${maxId + 1}`,
      description: partial.description ?? 'A newly founded clan',
      capacity: partial.capacity ?? 5,
      memberIds: partial.memberIds ?? [],
      emblemUrl: partial.emblemUrl,
    };
    this._clans.set([...list, newClan]);
    return newClan;
  }

  deleteClan(id: number) {
    this._clans.set(this._clans().filter(c => c.id !== id));
  }

  addMember(clanId: number, playerId: number) {
    this._clans.set(this._clans().map(c =>
      c.id === clanId
        ? { ...c, memberIds: Array.from(new Set([...c.memberIds, playerId])) }
        : c
    ));
  }

  removeMember(clanId: number, playerId: number) {
    this._clans.set(this._clans().map(c =>
      c.id === clanId
        ? { ...c, memberIds: c.memberIds.filter(id => id !== playerId) }
        : c
    ));
  }
}
