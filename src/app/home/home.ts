import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home {
  title = 'Welcome to the Quest App!';
  subtitle = 'Embark on epic adventures and earn XP!';
  image = 'assets/angular.svg';
}
