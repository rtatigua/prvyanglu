import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home {
  title = 'Welcome to the Quest App!';
  subtitle = 'Embark on epic adventures and earn XP!';
  image = 'assets/angular.svg';
}