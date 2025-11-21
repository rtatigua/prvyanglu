import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Player, Quest, Clan } from '../models';
import { PlayerService } from '../player.service';
import { ClanService } from '../clans/clans.service';

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './player.html',
  styleUrls: ['./player.scss','./player.forms.scss'],
})
export class Players {
  showForm = signal(false);
  avatarOptions: string[] = [];
  playerForm: FormGroup;
  players = computed(() => this.playerService.getPlayers());
  clans = computed(() => this.clanService.getClans().map(c => ({ ...c, members: this.playerService.getPlayers().filter(p => p.clanId === c.id) } as unknown as Clan)));

  constructor(private router: Router, private playerService: PlayerService, private clanService: ClanService, private fb: FormBuilder) {
    this.avatarOptions = this.playerService.getAvatarOptions();
    this.playerForm = this.fb.group({
      nickname: ['', [Validators.required, Validators.minLength(8)]],
      level: [1, [Validators.required, Validators.min(1)]],
      avatar: ['⚔️']
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
    this.playerService.addPlayer({ nickname: val.nickname, level: level, avatar: val.avatar });
    this.playerForm.reset({ nickname: '', level: 1, avatar: '⚔️' });
    this.showForm.set(false);
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
