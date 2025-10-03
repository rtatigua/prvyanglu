import { Component } from '@angular/core';
import { QuestItemComponent } from './quest-item';
import { QuestService, Quest } from './quest.service';

@Component({
  selector: 'app-quests',
  standalone: true,
  imports: [QuestItemComponent],
  templateUrl: './quests.html',
})
export class Quests {
  constructor(private questService: QuestService) {}

  get quests(): Quest[] {
    return this.questService.getQuests();
  }

  addQuest() {
    const maxId = Math.max(...this.quests.map(q => q.id), 0);
    const newQuest: Quest = {
      id: maxId + 1,
      title: 'New Quest',
      description: 'A mysterious new adventure awaits...',
      completed: false,
      xp: 50
    };
    this.questService.addQuest(newQuest);
  }

  deleteQuest(id: number) {
    this.questService.deleteQuest(id);
  }
}
