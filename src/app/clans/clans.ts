import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Clan, Player, Quest } from '../models';

@Component({
  selector: 'app-clans',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './clans.html',
  styleUrl: './clans.scss',
})
export class Clans {
  quests: Quest[] = [
    { id: 1, title: 'Slay the Dragon', description: 'Defeat the beast in the cave.', xp: 120 },
    { id: 2, title: 'Collect Herbs', description: 'Gather 10 healing herbs.', xp: 40 },
    { id: 3, title: 'Find the Lost Treasure', description: 'Locate the treasure map.', xp: 200 },
  ];

  private players: Player[] = [
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
  ];

  clansSignal = signal<Clan[]>([
    { id: 1, name: 'Fire Wolves', description: 'Hunters united by flame.', capacity: 5, members: [] },
    { id: 2, name: 'Shadow Foxes', description: 'Masters of stealth.', capacity: 4, members: [] },
  ]);

  get clans(): Clan[] {
    return this.clansSignal();
  }

  constructor(private router: Router) {
    this.updateClanMembers();
  }

  private updateClanMembers() {
    this.clansSignal.update(clans =>
      clans.map(clan => ({
        ...clan,
        members: this.players.filter(p => p.clanId === clan.id),
      }))
    );
  }

  addClan() {
    const newClan: Clan = {
      id: Math.max(...this.clansSignal().map(c => c.id), 0) + 1,
      name: 'New Clan ' + (this.clansSignal().length + 1),
      description: 'Freshly created clan.',
      capacity: 10,
      members: [],
    };
    this.clansSignal.update(clans => [...clans, newClan]);
  }

  removeClan(id: number) {
    // Remove clan and unassign players from it
    this.players.forEach(p => {
      if (p.clanId === id) {
        p.clanId = undefined;
      }
    });
    this.clansSignal.update(clans => clans.filter(c => c.id !== id));
    this.updateClanMembers();
  }

  openDetail(id: number) {
    this.router.navigate(['/clans', id]);
  }

  getAvailablePlayers(clanId: number): Player[] {
    return this.players.filter(p => p.clanId !== clanId);
  }
}
