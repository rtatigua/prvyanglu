import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Player, Quest, Clan } from '../models';
import { PlayerService } from '../player.service';
import { ClanService } from '../clans/clans.service';

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './player.html',
  styleUrls: ['./player.scss','./player.forms.scss'],
})
export class Players {
  showForm = signal(false);
  avatarOptions: string[] = [];

  newPlayer: Partial<Player> = {
    nickname: '',
    level: 1,
    avatar: '⚔️',
  };

  constructor(private router: Router, private playerService: PlayerService, private clanService: ClanService) {
    this.avatarOptions = this.playerService.getAvatarOptions();
  }

  get players(): Player[] {
    return this.playerService.getPlayers();
  }

  get clans(): Clan[] {
    return this.clanService.getClans().map(c => ({ ...c, members: this.playerService.getPlayers().filter(p => p.clanId === c.id) } as unknown as Clan));
  }

  addPlayer() {
    this.showForm.set(true);
  }

  createPlayer() {
    this.playerService.addPlayer({ nickname: this.newPlayer.nickname, level: this.newPlayer.level, avatar: this.newPlayer.avatar });
    this.newPlayer = { nickname: '', level: 1, avatar: '⚔️' };
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
