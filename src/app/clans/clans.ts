import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Clan, Player, Quest } from '../models';
import { ClanService } from './clans.service';
import { PlayerService } from '../player.service';

@Component({
  selector: 'app-clans',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clans.html',
  styleUrls: ['./clans.scss', './clans.forms.scss'],
})
export class Clans {
  showForm = signal(false);

  newClan: Partial<Clan> = {
    name: '',
    description: '',
    capacity: 5,
  };

  constructor(private router: Router, private clanService: ClanService, private playerService: PlayerService) {
    // constructor
  }

  get clans(): Clan[] {
    // map clan members to Player[] for templates
    return this.clanService.getClans().map(c => ({ ...c, members: this.playerService.getPlayers().filter(p => p.clanId === c.id) } as unknown as Clan));
  }

  addClan() {
    this.showForm.set(true);
  }

  createClan() {
    this.clanService.addClan({ name: this.newClan.name, description: this.newClan.description, capacity: this.newClan.capacity });
    this.showForm.set(false);
    this.newClan = { name: '', description: '', capacity: 5 };
  }

  removeClan(id: number) {
    // Unassign players from the clan first
    this.playerService.getPlayers().forEach(p => {
      if (p.clanId === id) {
        this.playerService.setPlayerClan(p.id, undefined);
      }
    });
    this.clanService.deleteClan(id);
  }

  openDetail(id: number) {
    this.router.navigate(['/clans', id]);
  }

  getAvailablePlayers(clanId: number): Player[] {
    return this.playerService.getPlayers().filter(p => p.clanId !== clanId);
  }
}
