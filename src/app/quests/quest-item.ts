import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Quest } from './quest.service';

@Component({
  selector: 'app-quest-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quest-item.html',
})
export class QuestItemComponent {
  @Input() quest!: Quest;
  @Output() delete = new EventEmitter<number>();

  onDelete() {
    this.delete.emit(this.quest.id);
  }
}
