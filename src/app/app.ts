import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  protected readonly title = signal('quests');

  header = 'Quest Overflow';
  header_logo = 'meteor-original.svg';

  showQuests = true;

  toggle() {
    this.showQuests = !this.showQuests;
    console.log('Toggled Quests visibility:', this.showQuests);
  }
}