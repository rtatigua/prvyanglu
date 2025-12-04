import { Injectable } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export type Quest = {
  id: number;
  title: string;
  description: string;
  xp: number;
};

@Injectable({
  providedIn: 'root'
})
export class QuestService {
  private readonly API_URL = 'http://localhost:3000';
  private _apiAvailable = false;
  private quests: Quest[] = [
    { id: 1, title: 'Slay the Dragon', description: 'Defeat the beast in the cave.', xp: 120 },
    { id: 2, title: 'Collect Herbs', description: 'Gather 10 healing herbs.', xp: 40 },
    { id: 3, title: 'Find the Lost Treasure', description: 'Locate the treasure map.', xp: 200 },
  ];

  constructor() {
    this.loadQuestsFromAPI();
  }

  private loadQuestsFromAPI() {
    fetch(`${this.API_URL}/quests`)
      .then(res => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then((quests: Quest[]) => {
        if (quests && quests.length > 0) {
          this.quests = quests;
          this._apiAvailable = true;
        }
      })
      .catch(() => { /* fallback to in-memory */ });
  }

  getQuests(): Quest[] {
    return [...this.quests];
  }

  getQuestById(id: number): Quest | undefined {
    return this.quests.find(q => q.id === id);
  }

  addQuest(newQuest: Quest) {
    this.quests.push(newQuest);
  }

  deleteQuest(id: number) {
    this.quests = this.quests.filter(q => q.id !== id);
  }

  // ===== ASYNC API METHODS =====
  addQuestAsync(quest: Quest): Observable<Quest> {
    if (this._apiAvailable) {
      return from(fetch(`${this.API_URL}/quests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quest)
      }).then(res => res.json() as Promise<Quest>)).pipe(
        tap(created => this.addQuest(created)),
        catchError(() => {
          this.addQuest(quest);
          return of(quest);
        })
      );
    }
    this.addQuest(quest);
    return of(quest);
  }

  deleteQuestAsync(id: number): Observable<void> {
    if (this._apiAvailable) {
      return from(fetch(`${this.API_URL}/quests/${id}`, { method: 'DELETE' }).then(() => undefined)).pipe(
        tap(() => this.deleteQuest(id)),
        catchError(() => {
          this.deleteQuest(id);
          return of(void 0);
        })
      );
    }
    this.deleteQuest(id);
    return of(void 0);
  }
}
