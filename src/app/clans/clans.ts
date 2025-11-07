import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ClanService } from './clans.service';

@Component({
  selector: 'app-clans',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clans.html',
  styleUrls: ['./clans.scss']
})
export class Clans {
  clans = this.clanService.clans;
  clanCount = computed(() => this.clans().length);

  constructor(private clanService: ClanService, private router: Router) {}

  addClan() {
    const newClan = this.clanService.addClan();
    this.router.navigate(['/clans', newClan.id]);
  }

  deleteClan(id: number, e?: Event) {
    if (e) e.stopPropagation();
    this.clanService.deleteClan(id);
  }

  goToDetail(id: number) {
    this.router.navigate(['/clans', id]);
  }
}
