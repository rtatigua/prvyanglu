import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-search',
  standalone: true,
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  @Input() searchQuery = '';
  @Output() searchQueryChange = new EventEmitter<string>();

  @Input() placeholder = 'Search...';

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery = value;
    this.searchQueryChange.emit(value);
  }
}
