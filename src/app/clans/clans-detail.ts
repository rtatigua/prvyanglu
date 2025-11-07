import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClanService, Clan } from './clans.service';
import { PlayerService } from '../players/player.service';

@Component({
  selector: 'app-clan-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './clans-detail.html',
  styleUrls: ['./clans.detail.scss']
})
export class ClanDetail {
  clan?: Clan;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clanService: ClanService,
    private playerService: PlayerService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.clan = this.clanService.getClanById(id);
  }

  goBack() {
    this.router.navigate(['/clans']);
  }

  get members() {
    if (!this.clan) return [];
    const players = this.playerService.getPlayers();
    return players.filter(p => this.clan?.memberIds.includes(p.id));
  }
}
