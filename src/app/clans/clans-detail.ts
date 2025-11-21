import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Clan, Player, Quest } from '../models';
import { ClanService } from './clans.service';
import { PlayerService } from '../player.service';

@Component({
  selector: 'app-clan-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './clans-detail.html',
  styleUrls: ['./clans-detail.scss'],
})
export class ClanDetail implements OnInit {
  clan?: Clan;
  allPlayers: Player[] = [];
  availablePlayers: Player[] = [];
  selectedPlayerId: number | null = null;

  constructor(private route: ActivatedRoute, private router: Router, private clanService: ClanService, private playerService: PlayerService) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadClanData(id);
  }

  private loadClanData(id: number) {
    this.clan = this.clanService.getClanById(id) as Clan | undefined;
    this.allPlayers = this.playerService.getPlayers();
    if (this.clan) {
      // populate members as Player[] for template
      this.clan.members = this.playerService.getPlayers().filter(p => p.clanId === this.clan?.id);
      this.updateAvailablePlayers();
    }
  }

  private updateAvailablePlayers() {
    if (this.clan) {
      this.availablePlayers = this.playerService.getPlayers().filter(
        p => p.clanId !== this.clan?.id && (this.clan!.members.length < this.clan!.capacity)
      );
    }
  }

  addPlayerToClan() {
    if (this.selectedPlayerId && this.clan && this.clan.members.length < this.clan.capacity) {
      const playerId = this.selectedPlayerId;
      const player = this.playerService.getPlayerById(playerId);
      
      // Remove player from their current clan if they have one
      if (player?.clanId && player.clanId !== this.clan.id) {
        this.clanService.removeMember(player.clanId, playerId);
      }
      
      // Add to new clan
      this.playerService.setPlayerClan(playerId, this.clan.id);
      this.clanService.addMember(this.clan.id, playerId);
      
      // refresh
      this.loadClanData(this.clan.id);
      this.selectedPlayerId = null;
    }
  }

  removePlayerFromClan(playerId: number) {
    if (!this.clan) return;
    this.playerService.setPlayerClan(playerId, undefined);
    this.clanService.removeMember(this.clan.id, playerId);
    this.loadClanData(this.clan.id);
  }

  isAtCapacity(): boolean {
    return this.clan ? this.clan.members.length >= this.clan.capacity : false;
  }

  goBack() {
    this.router.navigate(['/clans']);
  }

  goToPlayer(playerId: number) {
    this.router.navigate(['/players', playerId]);
  }
}
