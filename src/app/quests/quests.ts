import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestItemComponent } from './quest-item';
import { QuestService, Quest } from './quest.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quests',
  standalone: true,
  imports: [CommonModule, QuestItemComponent],
  templateUrl: './quests.html',
})
export class Quests implements OnInit, OnDestroy {
  quests = signal<Quest[]>([]);

  questCount = computed(() => this.quests().length);

  constructor(private questService: QuestService, private router: Router) {}

  ngOnInit(): void {
    console.log('Component was created');
    this.quests.set(this.questService.getQuests());
  }

  ngOnDestroy(): void {
    console.log('Component will be destroyed.');
  }

  addQuest() {
    const currentQuests = this.quests();
    const maxId = Math.max(...currentQuests.map(q => q.id), 0);

    const newQuest: Quest = {
      id: maxId + 1,
      title: 'New Quest',
      description: 'A mysterious new adventure awaits...',
      completed: false,
      xp: 50
    };

    this.quests.set([...currentQuests, newQuest]);
  }

  deleteQuest(id: number) {
    this.quests.set(this.quests().filter(q => q.id !== id));
  }

  goToDetail(id: number) {
    this.router.navigate(['/quests', id]);
  }
}
