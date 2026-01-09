import { playerLevels } from '../levels';
import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Player, PlayerFirestoreService } from './player-firestore.service';
import { Quest, QuestFirestoreService } from '../quests/quest-firestore.service';
import { QuestListComponent } from '../shared/quest-list.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

@Component({
  selector: 'app-player-detail',
  standalone: true,
  imports: [CommonModule, QuestListComponent, RouterLink],
  templateUrl: './player-detail.html',
  styleUrls: ['./player-detail.scss'],
})
export class PlayerDetail implements OnInit, OnDestroy {
  playerSignal = signal<Player | undefined>(undefined);
  assignedQuests = signal<Quest[]>([]);
  completedQuests = signal<Quest[]>([]);
  allQuests = toSignal(this.questService.quests$, { initialValue: [] });
  private destroy$ = new Subject<void>();

  // Computed signal for player level data
  playerLevelData = computed(() => {
    const player = this.playerSignal();
    if (!player) return { level: 0, levelTitle: '' };
    const level = this.getPlayerLevel(player.xp);
    return { level, levelTitle: `Level ${level}` };
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private playerService: PlayerFirestoreService,
    private questService: QuestFirestoreService
  ) {}

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    await this.uploadAvatar(file);
  }

  private async uploadAvatar(file: File) {
    const player = this.playerSignal();
    if (!player) return;
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `avatars/${player.id}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      this.playerService.updatePlayer(player.id, { avatar: url }).pipe(takeUntil(this.destroy$)).subscribe(() => {
        // reload or set signal will be updated from subscription in loadPlayerData
      });
    } catch (err) {
      console.error('Avatar upload failed', err);
    }
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPlayerData(id);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPlayerData(id: string) {
    this.playerService.players$
      .pipe(takeUntil(this.destroy$))
      .subscribe(players => {
        const player = players.find(p => p.id === id);
        this.playerSignal.set(player);

        if (player) {
          const quests = this.allQuests();
          this.assignedQuests.set(
            quests.filter((q: Quest) => player.assignedQuests.includes(q.id))
          );
          this.completedQuests.set(
            quests.filter((q: Quest) => player.completedQuests.includes(q.id))
          );
        }
      });
  }

  getPlayerLevel(xp: number): number {
    let level = 1;
    for (let i = playerLevels.length - 1; i >= 0; i--) {
      if (xp >= playerLevels[i].xpRequired) {
        level = playerLevels[i].level;
        break;
      }
    }
    return level;
  }

  isEmoji(text?: string): boolean {
    if (!text) return false;
    return /^[\p{Emoji}]+$/u.test(text);
  }

  completeQuest(questId: string) {
    const player = this.playerSignal();
    if (player) {
      const quest = this.allQuests().find((q: Quest) => q.id === questId);
      const xp = quest?.xp ?? 0;
      const updatedCompletedQuests = [...player.completedQuests, questId];
      const updatedXp = player.xp + xp;
      
      this.playerService.updatePlayer(player.id, {
        completedQuests: updatedCompletedQuests,
        xp: updatedXp
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe();
    }
  }

  uncompleteQuest(questId: string) {
    const player = this.playerSignal();
    if (player) {
      const quest = this.allQuests().find((q: Quest) => q.id === questId);
      const xp = quest?.xp ?? 0;
      const updatedCompletedQuests = player.completedQuests.filter(q => q !== questId);
      const updatedXp = Math.max(0, player.xp - xp);
      
      this.playerService.updatePlayer(player.id, {
        completedQuests: updatedCompletedQuests,
        xp: updatedXp
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe();
    }
  }

  assignQuest(questIdRaw: any) {
    const questId = questIdRaw as string;
    const player = this.playerSignal();
    if (!player || !questId) return;
    
    const updatedAssignedQuests = [...player.assignedQuests, questId];
    this.playerService.updatePlayer(player.id, {
      assignedQuests: updatedAssignedQuests
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe();
  }

  unassignQuest(questId: string) {
    const player = this.playerSignal();
    if (!player) return;
    
    const updatedAssignedQuests = player.assignedQuests.filter(q => q !== questId);
    this.playerService.updatePlayer(player.id, {
      assignedQuests: updatedAssignedQuests
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe();
  }

  goBack() {
    this.router.navigate(['/players']);
  }
}
