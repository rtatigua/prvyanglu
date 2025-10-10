import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Quests } from './quests/quests';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Quests],
  standalone: true,
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  protected readonly title = signal('quests');
  header = 'Quest Overflow';
  header_logo = "meteor-original.svg"
  showQuests = true
  toggle(){
    if (this.showQuests){
      this.showQuests = false
    }
    else {this.showQuests = true}
  }
}

