import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { QuestService, Quest } from './quest.service';
import { SearchComponent } from '../shared/search.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quests',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SearchComponent],
  templateUrl: './quests.html',
  styleUrls: ['./quests.scss', './quests.forms.scss']
})
export class Quests implements OnInit, OnDestroy {
  quests = signal<Quest[]>([]);
  showForm = signal(false);
  searchTerm = signal<string>('');
  questForm: FormGroup;

  // map questId -> expanded (show full description)
  private expandedMap = signal<Record<number, boolean>>({});

  questCount = computed(() => this.quests().length);

  filteredQuests = computed(() => {
    const s = this.searchTerm().trim().toLowerCase();
    if (!s) return this.quests();
    return this.quests().filter(q => (q.title || '').toLowerCase().includes(s) || (q.description || '').toLowerCase().includes(s));
  });

  constructor(private questService: QuestService, private router: Router, private fb: FormBuilder) {
    this.questForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(8)]],
      description: ['', Validators.required],
      xp: [50, [Validators.required, Validators.min(1)]],
      completed: [false]
    });
  }

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
    if (!this.questForm.valid) {
      alert('Quest Title is required and must be at least 8 characters long.');
      return;
    }
    const val = this.questForm.value;
    if (!val.title || val.title.trim().length < 8) {
      alert('Quest Title must be at least 8 characters long.');
      return;
    }
    const xp = Number(val.xp) || 0;
    if (!xp || xp <= 0) {
      alert('XP must be greater than 0!');
      return;
    }
    const current = this.questService.getQuests();
    const maxId = Math.max(...current.map(q => q.id), 0);
    const q: Quest = {
      id: maxId + 1,
      title: val.title,
      description: val.description || '',
      completed: !!val.completed,
      xp: xp,
    };
    this.questService.addQuest(q);
    this.quests.set(this.questService.getQuests());
    this.showForm.set(false);
    this.questForm.reset({ title: '', description: '', xp: 50, completed: false });
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