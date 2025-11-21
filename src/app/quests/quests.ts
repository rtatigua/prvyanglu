import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestService, Quest } from './quest.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quests.html',
  styleUrls: ['./quests.scss', './quests.forms.scss']
})
export class Quests implements OnInit, OnDestroy {
  quests = signal<Quest[]>([]);
  showForm = signal(false);

  newQuest: Partial<Quest> = {
    title: '',
    description: '',
    xp: 50,
    completed: false,
  };

  // map questId -> expanded (show full description)
  private expandedMap = signal<Record<number, boolean>>({});

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
    // open form when clicking add
    this.showForm.set(true);
  }

  createQuest() {
    const current = this.questService.getQuests();
    const maxId = Math.max(...current.map(q => q.id), 0);
    const q: Quest = {
      id: maxId + 1,
      title: this.newQuest.title || 'New Quest',
      description: this.newQuest.description || '',
      completed: !!this.newQuest.completed,
      xp: this.newQuest.xp || 0,
    };
    this.questService.addQuest(q);
    this.quests.set(this.questService.getQuests());
    this.showForm.set(false);
    this.newQuest = { title: '', description: '', xp: 50, completed: false };
  }

  deleteQuest(id: number) {
    this.quests.set(this.quests().filter(q => q.id !== id));
    // also remove any expanded state for deleted quest
    const map = { ...this.expandedMap() };
    if (map[id]) {
      delete map[id];
      this.expandedMap.set(map);
    }
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