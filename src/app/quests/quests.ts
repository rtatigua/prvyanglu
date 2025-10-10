import { Component, OnDestroy, OnInit } from '@angular/core';
import { QuestItemComponent } from './quest-item';
import { QuestService, Quest } from './quest.service';

@Component({
  selector: 'app-quests',
  standalone: true,
  imports: [QuestItemComponent],
  templateUrl: './quests.html',
})
export class Quests implements OnInit,OnDestroy {
  constructor(private questService: QuestService) {}
  ngOnInit(): void {
    console.log('Component was created');
  }
  ngOnDestroy(): void {
    console.log('Component will be destroyed.');
  }

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