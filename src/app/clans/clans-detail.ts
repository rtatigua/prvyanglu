import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Clan, Player, Quest } from '../models';

@Component({
  selector: 'app-clan-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './clans-detail.html',
  styleUrl: './clans-detail.scss',
})
export class ClanDetail implements OnInit {
  clan?: Clan;
  allPlayers: Player[] = [];
  availablePlayers: Player[] = [];
  selectedPlayerId: number | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadClanData(id);
  }

  private loadClanData(id: number) {
    // Mock data - same as in Clans component
    const quests: Quest[] = [
      { id: 1, title: 'Slay the Dragon', description: 'Defeat the beast in the cave.', xp: 120 },
      { id: 2, title: 'Collect Herbs', description: 'Gather 10 healing herbs.', xp: 40 },
      { id: 3, title: 'Find the Lost Treasure', description: 'Locate the treasure map.', xp: 200 },
    ];

    this.allPlayers = [
      {
        id: 1,
        nickname: 'Knightmare',
        level: 15,
        quests: [quests[0]],
        clanId: 1,
        avatar: 'assets/avatars/knight.png',
      },
      {
        id: 2,
        nickname: 'Herbalist',
        level: 5,
        quests: [quests[1]],
        avatar: 'assets/avatars/herbalist.png',
      },
      {
        id: 3,
        nickname: 'TreasureHunter',
        level: 12,
        quests: [quests[2]],
        clanId: 2,
        avatar: 'assets/avatars/hunter.png',
      },
    ];

    const allClans: Clan[] = [
      { id: 1, name: 'Fire Wolves', description: 'Hunters united by flame.', capacity: 5, members: [] },
      { id: 2, name: 'Shadow Foxes', description: 'Masters of stealth.', capacity: 4, members: [] },
    ];

    this.clan = allClans.find(c => c.id === id);
    if (this.clan) {
      this.clan.members = this.allPlayers.filter(p => p.clanId === this.clan?.id);
      this.updateAvailablePlayers();
    }
  }

  private updateAvailablePlayers() {
    if (this.clan) {
      this.availablePlayers = this.allPlayers.filter(
        p => p.clanId !== this.clan?.id && this.clan!.members.length < this.clan!.capacity
      );
    }
  }

  addPlayerToClan() {
    if (this.selectedPlayerId && this.clan && this.clan.members.length < this.clan.capacity) {
      const player = this.allPlayers.find(p => p.id === this.selectedPlayerId);
      if (player) {
        player.clanId = this.clan.id;
        this.clan.members.push(player);
        this.selectedPlayerId = null;
        this.updateAvailablePlayers();
      }
    }
  }

  removePlayerFromClan(playerId: number) {
    const player = this.allPlayers.find(p => p.id === playerId);
    if (player) {
      player.clanId = undefined;
      if (this.clan) {
        this.clan.members = this.clan.members.filter(m => m.id !== playerId);
        this.updateAvailablePlayers();
      }
    }
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
