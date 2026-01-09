import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { QuestFirestoreService, Quest } from './quest-firestore.service';
import { SearchComponent } from '../shared/search.component';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-quests',
  standalone: true,
  imports: [CommonModule, SearchComponent],
  templateUrl: './quests.html',
  styleUrls: ['./quests.scss', './quests.forms.scss']
})
export class Quests implements OnInit, OnDestroy {
  showForm = signal(false);
  searchTerm = signal<string>('');
  // signal-backed form fields
  title = signal<string>('');
  description = signal<string>('');
  xp = signal<number>(50);
  formValid = computed(() => this.title().trim().length >= 8 && Number(this.xp()) > 0);

  // map questId -> expanded (show full description)
  private expandedMap = signal<Record<string, boolean>>({});

  // Observable na Quests z Firestore, konvertované na signal
  quests = toSignal(this.questService.quests$, { initialValue: [] });

  questCount = computed(() => this.quests().length);

  filteredQuests = computed(() => {
    const s = this.searchTerm().trim().toLowerCase();
    if (!s) return this.quests();
    return this.quests().filter((q: Quest) => (q.title || '').toLowerCase().includes(s) || (q.description || '').toLowerCase().includes(s));
  });

  private destroy$ = new Subject<void>();

  constructor(private questService: QuestFirestoreService, private router: Router) {
  }

  ngOnInit(): void {
    console.log('Quests komponent inicializovaný');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addQuest() {
    this.showForm.set(true);
  }

  createQuest() {
    if (!this.formValid()) {
      alert('Názov questu je povinný a musí mať aspoň 8 znakov.');
      return;
    }
    const title = this.title().trim();
    const description = this.description() || '';
    const xp = Number(this.xp()) || 0;
    if (!xp || xp <= 0) {
      alert('XP musí byť väčšie ako 0!');
      return;
    }

    const newQuest = {
      title,
      description,
      xp
    };

    this.questService.addQuest(newQuest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (id) => {
          console.log('Quest pridaný s ID:', id);
          this.showForm.set(false);
          this.title.set('');
          this.description.set('');
          this.xp.set(50);
        },
        error: (err) => {
          console.error('Chyba pri pridávaní questu:', err);
          alert('Chyba pri pridávaní questu. Prosím skúste neskôr.');
        }
      });
  }

  deleteQuest(id: string) {
    this.questService.deleteQuest(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Quest vymazaný');
          const map = { ...this.expandedMap() };
          if (map[id]) {
            delete map[id];
            this.expandedMap.set(map);
          }
        },
        error: (err) => {
          console.error('Chyba pri vymazávaní questu:', err);
          alert('Chyba pri vymazávaní questu. Prosím skúste neskôr.');
        }
      });
  }

  goToDetail(id: string) {
    this.router.navigate(['/quests', id]);
  }

  isExpanded(id: string) {
    return !!this.expandedMap()[id];
  }

  toggleExpand(id: string) {
    const map = { ...this.expandedMap() };
    map[id] = !map[id];
    this.expandedMap.set(map);
  }
}
