import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Clan, Player, Quest } from '../models';
import { ClanService } from './clans.service';
import { PlayerService } from '../players/player.service';
import { SearchComponent } from '../shared/search.component';

@Component({
  selector: 'app-clans',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SearchComponent],
  templateUrl: './clans.html',
  styleUrls: ['./clans.scss', './clans.forms.scss'],
})
export class Clans {
  showForm = signal(false);
  searchTerm = signal<string>('');

  clanForm: FormGroup;

  constructor(private router: Router, private clanService: ClanService, private playerService: PlayerService, private fb: FormBuilder) {
    this.clanForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(8)]],
      description: [''],
      capacity: [5, [Validators.required, Validators.min(1)]]
    });
  }

  clans = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const base = this.clanService.getClans().map((c: any) => ({ ...c, members: this.playerService.getPlayers().filter((p: Player) => p.clanId === c.id) } as unknown as Clan));
    if (!search) return base;
    return base.filter(c => (c.name || '').toLowerCase().includes(search) || (c.description || '').toLowerCase().includes(search));
  });

  addClan() {
    this.clanForm.reset({ name: '', description: '', capacity: 5 });
    this.showForm.set(true);
  }

  createClan() {
    if (!this.clanForm.valid) {
      alert('Clan Name is required and must be at least 8 characters long.');
      return;
    }
    const val = this.clanForm.value;
    if (!val.name || val.name.trim().length < 8) {
      alert('Clan Name must be at least 8 characters long.');
      return;
    }
    const capacity = Number(val.capacity) || 0;
    if (!capacity || capacity <= 0) {
      alert('Capacity must be greater than 0!');
      return;
    }
    this.clanService.addClan({ name: val.name, description: val.description, capacity: capacity });
    this.showForm.set(false);
    this.clanForm.reset({ name: '', description: '', capacity: 5 });
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
