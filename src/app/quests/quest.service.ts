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
    { id: 1, title: 'Plesniva YES!-ka', description: 'Oblej si yesku džusom', completed: false, xp: 50 },
    { id: 2, title: 'Zapni spotify', description: 'Netraf svoju ulty', completed: false, xp: 75 },
    { id: 3, title: 'Kačka Hračka', description: 'Prejdi do dalšieho mesta ako kačička', completed: false, xp: 300 }
  ];

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
}
