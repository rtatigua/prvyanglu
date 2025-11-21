import { playerLevels } from '../levels';
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Player, Quest, Clan } from '../models';
import { PlayerService } from './player.service';
import { QuestService } from '../quests/quest.service';
import { QuestListComponent } from '../shared/quest-list.component';

@Component({
  selector: 'app-player-detail',
  standalone: true,
  imports: [CommonModule, QuestListComponent],
  templateUrl: './player-detail.html',
  styleUrls: ['./player-detail.scss'],
})
export class PlayerDetail implements OnInit {
  playerSignal = signal<Player | undefined>(undefined);
  assignedQuests = signal<Quest[]>([]);
  completedQuests = signal<Quest[]>([]);
  allQuests = signal<Quest[]>([]);
  selectedQuestId?: number;

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
    private playerService: PlayerService,
    private questService: QuestService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPlayerData(id);
  }

  private loadPlayerData(id: number) {
    const player = this.playerService.getPlayerById(id);
    this.playerSignal.set(player);
    this.allQuests.set(this.questService.getQuests());

    if (player) {
      this.assignedQuests.set(this.allQuests().filter((q: Quest) => player.assignedQuests.includes(q.id)));
      this.completedQuests.set(this.allQuests().filter((q: Quest) => player.completedQuests.includes(q.id)));
    }
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

  completeQuest(questId: number) {
    const player = this.playerSignal();
    if (player) {
      const quest = this.questService.getQuestById(questId);
      const xp = quest?.xp ?? 0;
      this.playerService.completeQuest(player.id, questId, xp);
      this.loadPlayerData(player.id);
    }
  }

  uncompleteQuest(questId: number) {
    const player = this.playerSignal();
    if (player) {
      this.playerService.uncompleteQuest(player.id, questId);
      this.loadPlayerData(player.id);
    }
  }

  assignQuest(questIdRaw: any) {
    const questId = Number(questIdRaw);
    const player = this.playerSignal();
    if (!player || !questId) return;
    this.playerService.assignQuestToPlayer(player.id, questId);
    this.loadPlayerData(player.id);
  }

  unassignQuest(questId: number) {
    const player = this.playerSignal();
    if (!player) return;
    this.playerService.removeQuestFromPlayer(player.id, questId);
    this.loadPlayerData(player.id);
  }

  goBack() {
    this.router.navigate(['/players']);
  }
}
