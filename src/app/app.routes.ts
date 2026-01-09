import { Routes } from '@angular/router';

import { Home } from './home/home';
import { Quests } from './quests/quests';
import { QuestDetail } from './quest-detail/quest-detail';

import { Players } from './players/player';
import { PlayerDetail } from './players/player-detail';

import { Clans } from './clans/clans';
import { ClanDetail } from './clans/clans-detail';

import { Login } from './auth/login';
import { Signup } from './auth/signup';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'quests', component: Quests, canActivate: [authGuard] },
  { path: 'quests/:id', component: QuestDetail, canActivate: [authGuard] },
  { path: 'players', component: Players, canActivate: [authGuard] },
  { path: 'players/:id', component: PlayerDetail, canActivate: [authGuard] },
  { path: 'clans', component: Clans, canActivate: [authGuard] },
  { path: 'clans/:id', component: ClanDetail, canActivate: [authGuard] },
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: '**', redirectTo: '' },
];