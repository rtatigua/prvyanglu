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
    { id: 1, title: 'Find the Lost Sword', description: 'Retrieve the legendary sword from the ancient ruins.', completed: false, xp: 120 },
    { id: 2, title: 'Rescue the Villagers', description: 'Save the villagers captured by goblins.', completed: true, xp: 60 },
    { id: 3, title: 'Collect Herbs', description: 'Gather 10 healing herbs for the village healer.', completed: false, xp: 30 }
  ];

  getQuests(): Quest[] {
    return this.quests;
  }

  addQuest(newQuest: Quest) {
    this.quests.push(newQuest);
  }

  deleteQuest(id: number) {
    this.quests = this.quests.filter(q => q.id !== id);
  }
}
