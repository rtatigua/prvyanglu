import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Player, Quest, Clan } from '../models';

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './player.html',
  styleUrl: './player.scss',
})
export class Players {
  quests: Quest[] = [
    { id: 1, title: 'Slay the Dragon', description: 'Defeat the beast in the cave.', xp: 120 },
    { id: 2, title: 'Collect Herbs', description: 'Gather 10 healing herbs.', xp: 40 },
    { id: 3, title: 'Find the Lost Treasure', description: 'Locate the treasure map.', xp: 200 },
  ];

  clans: Clan[] = [
    { id: 1, name: 'Fire Wolves', description: 'Hunters united by flame.', capacity: 5, members: [] },
    { id: 2, name: 'Shadow Foxes', description: 'Masters of stealth.', capacity: 4, members: [] },
  ];

  playersSignal = signal<Player[]>([
    {
      id: 1,
      nickname: 'Knightmare',
      level: 15,
      quests: [this.quests[0]],
      clanId: 1,
      avatar: 'assets/avatars/knight.png',
    },
    {
      id: 2,
      nickname: 'Herbalist',
      level: 5,
      quests: [this.quests[1]],
      avatar: 'assets/avatars/herbalist.png',
    },
    {
      id: 3,
      nickname: 'TreasureHunter',
      level: 12,
      quests: [this.quests[2]],
      clanId: 2,
      avatar: 'assets/avatars/hunter.png',
    },
  ]);

  get players(): Player[] {
    return this.playersSignal();
  }

  constructor(private router: Router) {
    this.updateClanMembers();
  }

  private updateClanMembers() {
    this.clans.forEach(clan => {
      clan.members = this.playersSignal().filter(p => p.clanId === clan.id);
    });
  }

  addPlayer() {
    const newPlayer: Player = {
      id: Math.max(...this.playersSignal().map(p => p.id), 0) + 1,
      nickname: 'Newbie' + (this.playersSignal().length + 1),
      level: 1,
      quests: [],
    };
    this.playersSignal.update(players => [...players, newPlayer]);
    this.updateClanMembers();
  }

  removePlayer(id: number) {
    this.playersSignal.update(players => players.filter(p => p.id !== id));
    this.updateClanMembers();
  }

  openDetail(id: number) {
    this.router.navigate(['/players', id]);
  }

  getClanName(id?: number) {
    return this.clans.find(c => c.id === id)?.name || 'No clan';
  }
}
