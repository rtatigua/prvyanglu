import { Component, model, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  // Model input for two-way binding
  searchQuery = model<string>('');
  placeholder = input<string>('🔍 Search...');

  clearSearch() {
    this.searchQuery.set('');
  }
}
