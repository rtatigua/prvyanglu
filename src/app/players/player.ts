import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Player, Quest, Clan } from '../models';
import { playerLevels } from '../levels';
import { PlayerService } from './player.service';
import { SearchComponent } from '../shared/search.component';
import { ClanService } from '../clans/clans.service';

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SearchComponent],
  templateUrl: './player.html',
  styleUrls: ['./player.scss','./player.forms.scss'],
})
export class Players {
  showForm = signal(false);
  avatarOptions: string[] = [];
  playerForm: FormGroup;
  players = computed(() => this.playerService.getPlayers());
  clans = computed(() => this.clanService.getClans().map((c: any) => ({ ...c, members: this.playerService.getPlayers().filter((p: Player) => p.clanId === c.id) } as unknown as Clan)));

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

  // Two-way friendly model property for template binding
  // get/set proxies the `searchTerm` signal so templates can use `[(model)]="searchModel"`
  get searchModel(): string {
    return this.searchTerm();
  }
  set searchModel(v: string) {
    this.searchTerm.set(v ?? '');
  }

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

  constructor(private router: Router, private playerService: PlayerService, private clanService: ClanService, private fb: FormBuilder) {
    this.avatarOptions = this.playerService.getAvatarOptions();
    this.playerForm = this.fb.group({
      nickname: ['', [Validators.required, Validators.minLength(8)]],
      level: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
      avatar: ['⚔️']
    });

    // Watch for level changes to enforce max level
    this.playerForm.get('level')?.valueChanges.subscribe((level) => {
      if (level >= 10) {
        this.playerForm.get('level')?.setValue(10, { emitEvent: false });
      }
    });
  }

  

  addPlayer() {
    this.playerForm.reset({ nickname: '', level: 1, avatar: '⚔️' });
    this.showForm.set(true);
  }

  createPlayer() {
    if (!this.playerForm.valid) {
      alert('Nickname is required and must be at least 8 characters long.');
      return;
    }
    const val = this.playerForm.value;
    const level = Number(val.level) || 1;
    const xp = playerLevels.find(l => l.level === level)?.xpRequired ?? 0;
    this.playerService.addPlayer({ nickname: val.nickname, xp: xp, avatar: val.avatar });
    this.playerForm.reset({ nickname: '', level: 1, avatar: '⚔️' });
    this.showForm.set(false);
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

  removePlayer(id: number) {
    const player = this.playerService.getPlayerById(id);
    if (player && player.clanId) {
      this.clanService.removeMember(player.clanId, id);
    }
    this.playerService.deletePlayer(id);
  }

  openDetail(id: number) {
    this.router.navigate(['/players', id]);
  }

  getClanName(id?: number) {
    return this.clanService.getClanById(id ?? -1)?.name || 'No clan';
  }

  isEmoji(text?: string): boolean {
    if (!text) return false;
    return /^[\p{Emoji}]+$/u.test(text);
  }
}
