import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Player, Quest, Clan } from '../models';
import { PlayerService } from '../player.service';
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
  player?: Player;
  assignedQuests: Quest[] = [];
  completedQuests: Quest[] = [];
  allQuests: Quest[] = [];

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
    this.player = this.playerService.getPlayerById(id);
    this.allQuests = this.questService.getQuests();

    if (this.player) {
      this.assignedQuests = this.allQuests.filter(q => this.player!.assignedQuests.includes(q.id));
      this.completedQuests = this.allQuests.filter(q => this.player!.completedQuests.includes(q.id));
    }
  }

  isEmoji(text?: string): boolean {
    if (!text) return false;
    return /^[\p{Emoji}]+$/u.test(text);
  }

  completeQuest(questId: number) {
    if (this.player) {
      this.playerService.completeQuest(this.player.id, questId);
      this.loadPlayerData(this.player.id);
    }
  }

  uncompleteQuest(questId: number) {
    if (this.player) {
      this.playerService.uncompleteQuest(this.player.id, questId);
      this.loadPlayerData(this.player.id);
    }
  }

  goBack() {
    this.router.navigate(['/players']);
  }
}
