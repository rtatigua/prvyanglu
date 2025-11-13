
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  templateUrl: './quest-item.html',
})
export class QuestItemComponent {
  quest = input.required<Quest>();
  delete = output<number>();
  onDelete() {
    this.delete.emit(this.quest().id);
  }
}
