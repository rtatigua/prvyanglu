import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PlayerService, Player } from './player.service';

@Component({
  selector: 'app-player-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './player-detail.html',
  styleUrls: ['./player-detail.scss']
})
export class PlayerDetail {
  player?: Player;
  id: number;

  constructor(private route: ActivatedRoute, private router: Router, private playerService: PlayerService) {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  private load() {
    this.player = this.playerService.getPlayerById(this.id);
  }

  goBack() {
    this.router.navigate(['/players']);
  }

  deletePlayer() {
    if (!this.player) return;
    this.playerService.deletePlayer(this.player.id);
    this.router.navigate(['/players']);
  }

  goToQuest(qid: number) {
    this.router.navigate(['/quests', qid]);
  }

  goToClan(cid?: number | null) {
    if (cid) this.router.navigate(['/clans', cid]);
  }
}
