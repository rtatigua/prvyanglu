
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore, connectFirestoreEmulator } from '@angular/fire/firestore';
import { getStorage } from 'firebase/storage';
import { provideStorage } from '@angular/fire/storage';
import { getAuth, provideAuth, connectAuthEmulator } from '@angular/fire/auth';

import { routes } from './app.routes';
import { firebaseConfig } from './firebase.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    // Firebase providery pre Angular 21 standalone aplikáciu
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => {
      const auth = getAuth();
      // if using auth emulator, connect here
      // if (location.hostname === 'localhost') connectAuthEmulator(auth, 'http://localhost:9099');
      return auth;
    }),
    provideStorage(() => getStorage()),
    provideFirestore(() => {
      const firestore = getFirestore();
      // Emulator temporarily disabled - connect directly to Firebase
      // if (location.hostname === 'localhost') {
      //   connectFirestoreEmulator(firestore, 'localhost', 8080);
      // }
      return firestore;
    })
  ]
};
