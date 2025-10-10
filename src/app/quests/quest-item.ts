import { Component, input, output } from '@angular/core';

export type Quest = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  xp: number;
};

@Component({
  selector: 'app-quest-item',
  standalone: true,
  imports: [],
  templateUrl: './quest-item.html',
})
export class QuestItemComponent {
  quest = input.required<Quest>();
  delete = output<number>();
  onDelete() {
    this.delete.emit(this.quest().id);
  }
}