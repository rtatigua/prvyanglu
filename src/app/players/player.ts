import { Component, signal, computed, OnDestroy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Player, PlayerFirestoreService } from './player-firestore.service';
import { SearchComponent } from '../shared/search.component';
import { ClanFirestoreService } from '../clans/clan-firestore.service';
import { playerLevels } from '../levels';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [CommonModule, SearchComponent],
  templateUrl: './player.html',
  styleUrls: ['./player.scss','./player.forms.scss'],
})
export class Players implements OnDestroy {
  showForm = signal(false);
  avatarOptions: string[] = ['🤺', '🌿', '💎', '🐉', '⚔️', '🎯', '👑', '🧙', '🏹', '⚡'];

  // signal-based form fields
  nickname = signal<string>('');
  level = signal<number>(1);
  avatar = signal<string>('⚔️');
  formValid = computed(() => this.nickname().trim().length >= 3 && this.level() >= 1 && this.level() <= 10);

  // Observable players z Firestore, konvertované na signal
  players = toSignal(this.playerService.players$, { initialValue: [] });
  clans = toSignal(this.clanService.clans$, { initialValue: [] });

  // Computed signals for each player's level data
  playersWithLevelData = computed(() => 
    this.players().map((p: Player) => ({
      ...p,
      level: this.getPlayerLevel(p.xp),
      levelTitle: this.getPlayerLevelTitle(p.xp),
      levelPercent: this.getPlayerLevelPercent(p.xp),
      xpToNext: this.getPlayerXpToNext(p.xp)
    }))
  );

  // Filter state: selected level title ('' or 'All' = no filter)
  levelFilter = signal<string>('All');
  levelOptions = playerLevels.map(l => l.title);
  // Search state
  searchTerm = signal<string>('');

  // Computed filtered players based on selected level title and search term
  filteredPlayersWithLevelData = computed(() => {
    const sel = this.levelFilter();
    const search = this.searchTerm().trim().toLowerCase();
    let list = this.playersWithLevelData();
    if (sel && sel !== 'All') {
      list = list.filter((p: any) => p.levelTitle === sel);
    }
    if (search) {
      list = list.filter((p: any) => p.nickname.toLowerCase().includes(search));
    }
    return list;
  });

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router, 
    private playerService: PlayerFirestoreService, 
    private clanService: ClanFirestoreService
  ) {
  }

  addPlayer() {
    this.nickname.set('');
    this.level.set(1);
    this.avatar.set('⚔️');
    this.showForm.set(true);
  }

  createPlayer() {
    if (!this.formValid()) {
      alert('Prezývka je povinná a musí mať aspoň 8 znakov.');
      return;
    }
    const level = Number(this.level()) || 1;
    const xp = playerLevels.find(l => l.level === level)?.xpRequired ?? 0;
    
    const newPlayer = {
      nickname: this.nickname(),
      xp: xp,
      avatar: this.avatar(),
      assignedQuests: [],
      completedQuests: [],
      clanId: undefined
    };

    this.playerService.addPlayer(newPlayer)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (id) => {
          console.log('Hráč pridaný s ID:', id);
          this.nickname.set('');
          this.level.set(1);
          this.avatar.set('⚔️');
          this.showForm.set(false);
        },
        error: (err) => {
          console.error('Chyba pri pridávaní hráča:', err);
          alert('Chyba pri pridávaní hráča. Prosím skúste neskôr.');
        }
      });
  }

  getPlayerLevel(xp: number): number {
    let level = 1;
    for (let i = playerLevels.length - 1; i >= 0; i--) {
      if (xp >= playerLevels[i].xpRequired) {
        level = playerLevels[i].level;
        break;
      }
    }
    return level;
  }

  getPlayerLevelTitle(xp: number): string {
    const lvl = this.getPlayerLevel(xp);
    return playerLevels.find(l => l.level === lvl)?.title || 'Novice';
  }

  getPlayerLevelPercent(xp: number): number {
    const lvl = this.getPlayerLevel(xp);
    const current = playerLevels.find(l => l.level === lvl);
    const next = playerLevels.find(l => l.level === lvl + 1);
    if (!current || !next) return 100;
    const range = next.xpRequired - current.xpRequired;
    const progress = xp - current.xpRequired;
    return Math.min(100, Math.round((progress / range) * 100));
  }

  getPlayerXpToNext(xp: number): number {
    const lvl = this.getPlayerLevel(xp);
    const next = playerLevels.find(l => l.level === lvl + 1);
    if (!next) return 0;
    return Math.max(0, next.xpRequired - xp);
  }

  removePlayer(id: string) {
    this.playerService.deletePlayer(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Hráč vymazaný');
        },
        error: (err) => {
          console.error('Chyba pri vymazávaní hráča:', err);
          alert('Chyba pri vymazávaní hráča. Prosím skúste neskôr.');
        }
      });
  }

  openDetail(id: string) {
    this.router.navigate(['/players', id]);
  }

  getClanName(id?: string) {
    if (!id) return 'No clan';
    return this.clanService.getClans().find(c => c.id === id)?.name || 'No clan';
  }

  isEmoji(text?: string): boolean {
    if (!text) return false;
    return /^[\p{Emoji}]+$/u.test(text);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
