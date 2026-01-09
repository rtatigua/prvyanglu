import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { playerLevels } from '../levels';
import { Clan, ClanFirestoreService } from './clan-firestore.service';
import { Player, PlayerFirestoreService } from '../players/player-firestore.service';
import { Subject, forkJoin, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-clan-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './clans-detail.html',
  styleUrls: ['./clans-detail.scss'],
})
export class ClanDetail implements OnInit, OnDestroy {
  clan = signal<Clan | undefined>(undefined);
  allPlayers = toSignal(this.playerService.players$, { initialValue: [] });
  selectedPlayerId = signal<string | null>(null);
  private destroy$ = new Subject<void>();

  availablePlayers = computed(() => {
    const currentClan = this.clan();
    if (!currentClan) return [];
    return this.allPlayers().filter(
      p => p.clanId !== currentClan.id && 
           (currentClan.members?.length ?? 0) < currentClan.capacity
    );
  });

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clanService: ClanFirestoreService,
    private playerService: PlayerFirestoreService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadClanData(id);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadClanData(id: string) {
    combineLatest([this.clanService.clans$, this.playerService.players$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([clans, players]) => {
        const currentClan = clans.find((c: Clan) => c.id === id);
        if (currentClan) {
          // Pridaj members z players (ako Player objekty, nie len IDs) a reaguj na zmeny hráčov/klanov
          const clanMembers = (players as Player[]).filter((p: Player) => p.clanId === currentClan.id);
          currentClan.members = clanMembers as any;
          this.clan.set(currentClan);
        }
      });
  }

  addPlayerToClan() {
    const selectedId = this.selectedPlayerId();
    const currentClan = this.clan();
    
    if (selectedId && currentClan && (currentClan.members?.length ?? 0) < currentClan.capacity) {
      const player = this.allPlayers().find((p: Player) => p.id === selectedId);
      if (player) {
        const ops: any[] = [];
        ops.push(this.playerService.updatePlayer(player.id, { clanId: currentClan.id }));
        ops.push(this.clanService.addMember(currentClan.id, player.id));
        if (player.clanId && player.clanId !== currentClan.id) {
          ops.push(this.clanService.removeMember(player.clanId, player.id));
        }

        forkJoin(ops).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            this.selectedPlayerId.set(null);
          },
          error: (err) => {
            console.error('Chyba pri pridávaní hráča do klanu:', err);
            alert('Chyba pri pridávaní hráča do klanu. Skúste to prosím znova.');
          }
        });
      }
    }
  }

  removePlayerFromClan(playerId: string) {
    const currentClan = this.clan();
    if (!currentClan) return;
    const ops: any[] = [];
    ops.push(this.playerService.updatePlayer(playerId, { clanId: undefined }));
    ops.push(this.clanService.removeMember(currentClan.id, playerId));
    forkJoin(ops).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        // successful
      },
      error: (err) => {
        console.error('Chyba pri odstraňovaní hráča z klanu:', err);
        alert('Chyba pri odstraňovaní hráča z klanu. Skúste to prosím znova.');
      }
    });
  }

  isAtCapacity(): boolean {
    const currentClan = this.clan();
    return currentClan ? (currentClan.members?.length ?? 0) >= currentClan.capacity : false;
  }

  goBack() {
    this.router.navigate(['/clans']);
  }

  goToPlayer(playerId: string) {
    this.router.navigate(['/players', playerId]);
  }
}
