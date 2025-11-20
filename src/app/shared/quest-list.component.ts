import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Quest } from '../models';

@Component({
  selector: 'app-quest-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="quest-list">
      @if (quests.length) {
        @for (q of quests; track q.id) {
          <div class="quest-item">
            <div class="quest-info">
              <p>
                <a [routerLink]="['/quests', q.id]">{{ q.title }}</a>
              </p>
              <p class="xp">{{ q.xp }} XP</p>
            </div>
            @if (actionButton && actionLabel) {
              <button [attr.aria-label]="actionLabel" (click)="onAction.emit(q.id)" class="action-btn">
                {{ actionLabel }}
              </button>
            }
          </div>
        }
      } @else {
        <p class="empty-message">{{ emptyMessage }}</p>
      }
    </div>
  `,
  styles: [`
    .quest-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .quest-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.6rem;
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.04);
      border-radius: 6px;
    }
    .quest-info { flex: 1; }
    .quest-info p { margin: 0; color: #c0ccd6; font-size: 0.9rem; }
    .quest-info .xp { color: #ffd54f; font-weight: 600; }
    .action-btn { padding: 4px 8px; background: #42a5f5; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem; margin-left: 0.5rem; }
    .empty-message { color: #8a92a0; font-size: 0.9rem; text-align: center; padding: 1rem; }
  `]
})
export class QuestListComponent {
  @Input() quests: Quest[] = [];
  @Input() actionButton: boolean = false;
  @Input() actionLabel: string = 'Action';
  @Input() emptyMessage: string = 'No quests.';
  @Output() onAction = new EventEmitter<number>();
}
