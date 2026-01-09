import { Injectable, signal } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Router } from '@angular/router';
import { PlayerFirestoreService } from '../players/player-firestore.service';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  // reactive login state for template consumption
  public isLoggedIn = signal<boolean>(false);

  constructor(private auth: Auth, private router: Router, private playerService: PlayerFirestoreService) {
    // keep signal in sync with Firebase auth state
    onAuthStateChanged(this.auth, user => this.isLoggedIn.set(!!user));
  }

  /**
   * Sign in and ensure a player profile exists. Returns player id.
   */
  async login(email: string, password: string): Promise<string> {
    try {
      const cred = await signInWithEmailAndPassword(this.auth, email, password);
      const uid = cred.user.uid;

      // Try to find existing player by uid
      const existing = await this.playerService.findByUid(uid);
      if (existing) return existing.id;

      // Create a basic player record if none exists
      const nickname = cred.user.email ? cred.user.email.split('@')[0] : 'Player';
      const newPlayer: any = {
        nickname,
        xp: 0,
        assignedQuests: [],
        completedQuests: [],
        avatar: '⚔️',
        uid
      };

      const id = await firstValueFrom(this.playerService.addPlayer(newPlayer));
      return id;
    } catch (err: any) {
      console.error('Auth.login error', err);
      throw new Error(this.mapAuthError(err));
    }
  }

  /**
   * Create account and corresponding player record. Returns player id.
   */
  async register(email: string, password: string, nickname?: string, avatarFile?: File, soundFile?: File): Promise<string> {
    try {
      const cred = await createUserWithEmailAndPassword(this.auth, email, password);
      const uid = cred.user.uid;

      // create player record
      const finalNickname = nickname || (cred.user.email ? cred.user.email.split('@')[0] : 'Player');
      const newPlayer: any = {
        nickname: finalNickname,
        xp: 0,
        assignedQuests: [],
        completedQuests: [],
        avatar: '⚔️',
        uid
      };

      // optionally upload avatar and/or sound to Storage and attach URLs
      // Upload avatar and sound to Storage — fail registration if upload fails
      if (avatarFile || soundFile) {
        const storage = getStorage();
        try {
          if (avatarFile) {
            const aRef = storageRef(storage, `avatars/${uid}/${Date.now()}_${avatarFile.name}`);
            await uploadBytes(aRef, avatarFile);
            const url = await getDownloadURL(aRef);
            newPlayer.avatar = url;
          }

          if (soundFile) {
            const sRef = storageRef(storage, `sounds/${uid}/${Date.now()}_${soundFile.name}`);
            await uploadBytes(sRef, soundFile);
            const soundUrl = await getDownloadURL(sRef);
            newPlayer.sound = soundUrl;
          }
        } catch (uploadErr) {
          console.error('Storage upload error during register', uploadErr);
          throw uploadErr; // surface upload error so signup can show it
        }
      }

      const id = await firstValueFrom(this.playerService.addPlayer(newPlayer));
      return id;
    } catch (err: any) {
      console.error('Auth.register error', err);
      throw new Error(this.mapAuthError(err));
    }
  }

  private mapAuthError(err: any): string {
    const code = err?.code || err?.status || '';
    switch (code) {
      case 'auth/wrong-password':
        return 'Wrong password. Please try again.';
      case 'auth/user-not-found':
        return 'No account found for this email.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/email-already-in-use':
        return 'Email already in use. Try logging in instead.';
      case 'auth/weak-password':
        return 'Password is too weak. Use at least 6 characters.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error: check your internet connection.';
      default:
        // fallback to message if present
        return err?.message || 'Authentication failed. Check the console for details.';
    }
  }

  logout() {
    return signOut(this.auth).then(() => this.router.navigate(['/']));
  }

  get currentUser() {
    return this.auth.currentUser;
  }
}
