import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Quest, QuestFirestoreService } from '../quests/quest-firestore.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-quest-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quest-detail.html',
  styleUrls: ['./quest-detail.scss']
})
export class QuestDetail implements OnInit, OnDestroy {
  quest = signal<Quest | undefined>(undefined);
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private questService: QuestFirestoreService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.questService.getQuestById(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(quest => {
          this.quest.set(quest);
        });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack() {
    this.router.navigate(['/quests']);
  }
}