import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import './app/firebase.config';

bootstrapApplication(App, appConfig);
