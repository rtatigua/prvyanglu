import { Routes } from '@angular/router';

import { Quests } from './quests/quests';
import { QuestDetail } from './quests/quests';

import { Players } from './players/players';
import { PlayerDetail } from './players/player-detail';

import { Clans } from './clans/clans';
import { ClanDetail } from './clans/clans-detail';

export const routes: Routes = [
  { path: '', redirectTo: 'quests', pathMatch: 'full' },
  { path: 'quests', component: Quests },
  { path: 'quests/:id', component: QuestDetail },
  { path: 'players', component: Players },
  { path: 'players/:id', component: PlayerDetail },
  { path: 'clans', component: Clans },
  { path: 'clans/:id', component: ClanDetail },
  { path: '**', redirectTo: 'quests' },
];
