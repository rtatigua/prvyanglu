import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Quest } from '../models';

@Component({
  selector: 'app-quest-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quest-item.html',
})
export class QuestItemComponent {
  @Input() quest!: Quest;
  @Output() delete = new EventEmitter<string>();

  onDelete() {
    this.delete.emit(this.quest.id);
  }
}
