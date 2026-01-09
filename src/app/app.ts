import { Component, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  protected readonly title = signal('quests');

  header = 'Quest Overflow';
  header_logo = 'meteor-original.svg';

  showQuests = true;

  constructor(public auth: AuthService) {}

  toggle() {
    this.showQuests = !this.showQuests;
    console.log('Toggled Quests visibility:', this.showQuests);
  }
}