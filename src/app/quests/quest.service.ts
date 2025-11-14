import { Injectable } from '@angular/core';

export type Quest = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  xp: number;
};

@Injectable({
  providedIn: 'root'
})
export class QuestService {
  private quests: Quest[] = [
    { id: 1, title: 'Find the Lost Sword', description: 'Retrieve the legendary sword from the haunted canyon.', completed: false, xp: 50 },
    { id: 2, title: 'Defeat the Bandits', description: 'Clear the bandit camp and rescue the merchant caravan.', completed: false, xp: 75 },
    { id: 3, title: 'Collect Herbs', description: 'Gather 10 healing herbs for the village healer.', completed: false, xp: 30 }
  ];

  getQuests(): Quest[] {
    // return a shallow copy so callers can set a signal safely
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
}
