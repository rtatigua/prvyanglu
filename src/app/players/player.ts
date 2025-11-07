import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PlayerService } from './player.service';

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player.html',
  styleUrls: ['./player.scss']
})
export class Players {
  players = this.playerService.players;
  playersCount = computed(() => this.players().length);

  constructor(private playerService: PlayerService, private router: Router) {}

  addPlayer() {
    const p = this.playerService.addPlayer();
    this.router.navigate(['/players', p.id]);
  }

  deletePlayer(id: number, event?: Event) {
    if (event) event.stopPropagation();
    this.playerService.deletePlayer(id);
  }

  goToDetail(id: number) {
    this.router.navigate(['/players', id]);
  }
}
