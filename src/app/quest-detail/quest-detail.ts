import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestService, Quest } from '../quests/quest.service';

@Component({
  selector: 'app-quest-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quest-detail.html',
  styleUrls: ['./quest-detail.scss']
})
export class QuestDetail {
  quest?: Quest;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private questService: QuestService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.quest = this.questService.getQuests().find(q => q.id === id);
  }

  goBack() {
    this.router.navigate(['/quests']);
  }
}