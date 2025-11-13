import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Player, Quest, Clan } from '../models';

@Component({
  selector: 'app-player-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './player-detail.html',
  styleUrl: './player-detail.scss',
})
export class PlayerDetail implements OnInit {
  player?: Player;
  clan?: Clan;
  allPlayers: Player[] = [];
  allClans: Clan[] = [];

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPlayerData(id);
  }

  private loadPlayerData(id: number) {
    // Mock data - same as in Players component
    const quests: Quest[] = [
      { id: 1, title: 'Slay the Dragon', description: 'Defeat the beast in the cave.', xp: 120 },
      { id: 2, title: 'Collect Herbs', description: 'Gather 10 healing herbs.', xp: 40 },
      { id: 3, title: 'Find the Lost Treasure', description: 'Locate the treasure map.', xp: 200 },
    ];

    this.allClans = [
      { id: 1, name: 'Fire Wolves', description: 'Hunters united by flame.', capacity: 5, members: [] },
      { id: 2, name: 'Shadow Foxes', description: 'Masters of stealth.', capacity: 4, members: [] },
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

    this.player = this.allPlayers.find(p => p.id === id);
    if (this.player && this.player.clanId) {
      this.clan = this.allClans.find(c => c.id === this.player?.clanId);
    }
  }

  goBack() {
    this.router.navigate(['/players']);
  }

  goToClan(clanId?: number) {
    if (clanId) {
      this.router.navigate(['/clans', clanId]);
    }
  }

  goToQuest(questId: number) {
    this.router.navigate(['/quests', questId]);
  }
}
