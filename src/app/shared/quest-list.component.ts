import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Quest } from '../models';

@Component({
  selector: 'app-quest-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './quest-list.component.html',
  styleUrls: ['./quest-list.component.scss']
})
export class QuestListComponent {
  // Input: list of quests to render
  @Input() quests: Quest[] = [];
  // Input: whether to show the action button for each quest
  @Input() actionButton: boolean = false;
  // Input: label for the action button
  @Input() actionLabel: string = 'Action';
  // Input: fallback message when list is empty
  @Input() emptyMessage: string = 'No quests.';
  // Output: emits the quest id when the action button is clicked
  @Output() onAction = new EventEmitter<string>();
  
  handleActionClick(qid: string) {
    this.onAction.emit(qid);
  }
}
