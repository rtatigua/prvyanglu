import { Routes } from '@angular/router';

import { Home } from './home/home';
import { Quests } from './quests/quests';
import { QuestDetail } from './quest-detail/quest-detail';

import { Players } from './players/player';
import { PlayerDetail } from './players/player-detail';

import { Clans } from './clans/clans';
import { ClanDetail } from './clans/clans-detail';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'quests', component: Quests },
  { path: 'quests/:id', component: QuestDetail },
  { path: 'players', component: Players },
  { path: 'players/:id', component: PlayerDetail },
  { path: 'clans', component: Clans },
  { path: 'clans/:id', component: ClanDetail },
  { path: '**', redirectTo: '' },
];