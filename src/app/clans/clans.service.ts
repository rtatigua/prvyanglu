import { Injectable, signal } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export type Clan = {
  id: number;
  name: string;
  description: string;
  capacity: number;
  memberIds?: number[];
  members?: any[];
  emblemUrl?: string;
};

@Injectable({ providedIn: 'root' })
export class ClanService {
  private readonly API_URL = 'http://localhost:3000';
  private _apiAvailable = false;
  private _clans = signal<Clan[]>([
    { id: 1, name: 'Dragon Slayers', description: 'Elite warriors dedicated to defeating dragons and protecting the realm', capacity: 10, memberIds: [1] },
    { id: 2, name: 'Treasure Seekers', description: 'Adventurers hunting for ancient treasures and lost artifacts', capacity: 8, memberIds: [3] },
  ]);

  clans = () => this._clans();

  constructor() {
    this.loadClansFromAPI();
  }

  private loadClansFromAPI() {
    fetch(`${this.API_URL}/clans`)
      .then(res => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then((clans: Clan[]) => {
        if (clans && clans.length > 0) {
          this._clans.set(clans);
          this._apiAvailable = true;
        }
      })
      .catch(() => { /* fallback to in-memory */ });
  }

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
        ? { ...c, memberIds: Array.from(new Set([...(c.memberIds ?? []), playerId])) }
        : c
    ));
  }

  removeMember(clanId: number, playerId: number) {
    this._clans.set(this._clans().map(c =>
      c.id === clanId
        ? { ...c, memberIds: (c.memberIds ?? []).filter(id => id !== playerId) }
        : c
    ));
  }

  // ===== ASYNC API METHODS =====
  addClanAsync(clan: Partial<Clan>): Observable<Clan> {
    const newClan = this.addClan(clan);
    if (this._apiAvailable) {
      return from(fetch(`${this.API_URL}/clans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClan)
      }).then(res => res.json() as Promise<Clan>)).pipe(
        catchError(() => of(newClan))
      );
    }
    return of(newClan);
  }

  deleteClanAsync(id: number): Observable<void> {
    if (this._apiAvailable) {
      return from(fetch(`${this.API_URL}/clans/${id}`, { method: 'DELETE' }).then(() => undefined)).pipe(
        tap(() => this.deleteClan(id)),
        catchError(() => {
          this.deleteClan(id);
          return of(void 0);
        })
      );
    }
    this.deleteClan(id);
    return of(void 0);
  }
}
