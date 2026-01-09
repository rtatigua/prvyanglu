import { Component, signal, computed, OnDestroy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Clan, ClanFirestoreService } from './clan-firestore.service';
import { SearchComponent } from '../shared/search.component';
import { PlayerFirestoreService, Player } from '../players/player-firestore.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-clans',
  standalone: true,
  imports: [CommonModule, SearchComponent],
  templateUrl: './clans.html',
  styleUrls: ['./clans.scss', './clans.forms.scss'],
})
export class Clans implements OnDestroy {
  showForm = signal(false);
  searchTerm = signal<string>('');

  // signal-backed form fields
  name = signal<string>('');
  description = signal<string>('');
  capacity = signal<number>(5);
  formValid = computed(() => this.name().trim().length >= 8 && Number(this.capacity()) >= 1);

  // Observable clans a players z Firestore, konvertované na signals
  clans = toSignal(this.clanService.clans$, { initialValue: [] });
  players = toSignal(this.playerService.players$, { initialValue: [] });

  // Computed filtered clans based on search term
  filteredClans = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const base = this.clans().map((c: Clan) => ({
      ...c,
      members: this.players().filter((p: Player) => p.clanId === c.id)
    }));
    if (!search) return base;
    return base.filter((c: any) => (c.name || '').toLowerCase().includes(search) || (c.description || '').toLowerCase().includes(search));
  });

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private clanService: ClanFirestoreService,
    private playerService: PlayerFirestoreService
  ) {
  }

  addClan() {
    this.name.set('');
    this.description.set('');
    this.capacity.set(5);
    this.showForm.set(true);
  }

  createClan() {
    if (!this.formValid()) {
      alert('Názov klanu je povinný a musí mať aspoň 8 znakov.');
      return;
    }
    const name = this.name().trim();
    const description = this.description() || '';
    const capacity = Number(this.capacity()) || 0;
    if (!capacity || capacity <= 0) {
      alert('Kapacita musí byť väčšia ako 0!');
      return;
    }
    
    const newClan = {
      name,
      description,
      capacity
    };

    this.clanService.addClan(newClan)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (id) => {
          console.log('Klan pridaný s ID:', id);
          this.showForm.set(false);
          this.name.set('');
          this.description.set('');
          this.capacity.set(5);
        },
        error: (err) => {
          console.error('Chyba pri pridávaní klanu:', err);
          alert('Chyba pri pridávaní klanu. Prosím skúste neskôr.');
        }
      });
  }

  removeClan(id: string) {
    this.clanService.deleteClan(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Klan vymazaný');
        },
        error: (err) => {
          console.error('Chyba pri vymazávaní klanu:', err);
          alert('Chyba pri vymazávaní klanu. Prosím skúste neskôr.');
        }
      });
  }

  openDetail(id: string) {
    this.router.navigate(['/clans', id]);
  }

  getAvailablePlayers(clanId: string): Player[] {
    return this.players().filter((p: Player) => p.clanId !== clanId);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
