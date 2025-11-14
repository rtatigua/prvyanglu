import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestService, Quest } from './quest.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quests.html',
  styleUrls: ['./quests.scss']
})
export class Quests implements OnInit, OnDestroy {

  // signal for quest list
  quests = signal<Quest[]>([]);

  // computed boolean for template ngIf
  hasQuests = computed(() => this.quests().length > 0);

  // map for expanded states (questId -> boolean)
  expandedMap = signal<{ [key: number]: boolean }>({});

  constructor(
    private questService: QuestService,
    private router: Router
  ) {}

  ngOnInit() {
    // load initial quests from service
    const fromService = this.questService.getQuests() ?? [];
    this.quests.set(fromService);
  }

  ngOnDestroy() {}

  // returns number of quests (used by template)
  questCount() {
    return this.quests().length;
  }

  addQuest() {
    const newId = this.quests().length ? Math.max(...this.quests().map(q => q.id)) + 1 : 1;
    const newQuest: Quest = {
      id: newId,
      title: `New Quest #${newId}`,
      description: 'Describe the quest here...',
      completed: false,
      xp: 10
    };
    this.questService.addQuest(newQuest);
    this.quests.set(this.questService.getQuests());
  }

  deleteQuest(id: number) {
    this.questService.deleteQuest(id);
    this.quests.set(this.questService.getQuests());
  }

  goToDetail(id: number) {
    this.router.navigate(['/quests', id]);
  }

  isExpanded(id: number) {
    return !!this.expandedMap()[id];
  }

  toggleExpand(id: number) {
    const map = { ...this.expandedMap() };
    map[id] = !map[id];
    this.expandedMap.set(map);
  }
}
