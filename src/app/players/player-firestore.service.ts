import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc,
  onSnapshot,
  updateDoc,
  deleteField,
  serverTimestamp,
  QuerySnapshot
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { from } from 'rxjs';

export type Player = {
  id: string;
  nickname: string;
  xp: number;
  assignedQuests: string[];
  completedQuests: string[];
  clanId?: string;
  avatar?: string;
  createdAt?: Date;
  uid?: string;
};

@Injectable({
  providedIn: 'root'
})
export class PlayerFirestoreService {
  private playersSubject = new BehaviorSubject<Player[]>([]);
  players$ = this.playersSubject.asObservable();
  private unsubscribe: (() => void) | null = null;

  constructor() {
    this.loadPlayersFromFirestore();
  }

  private loadPlayersFromFirestore() {
    const playersCollection = collection(db, 'players');
    
    this.unsubscribe = onSnapshot(playersCollection, (snapshot: QuerySnapshot) => {
      const players: Player[] = [];
      snapshot.forEach((doc) => {
        players.push({
          id: doc.id,
          ...doc.data()
        } as Player);
      });
      this.playersSubject.next(players);
    }, (error) => {
      console.error('Chyba pri načítaní hráčov z Firestore:', error);
    });
  }

  getPlayers$(): Observable<Player[]> {
    return this.players$;
  }

  getPlayers(): Player[] {
    return this.playersSubject.value;
  }

  findByUid(uid: string): Player | undefined {
    return this.playersSubject.value.find(p => p.uid === uid);
  }

  addPlayer(player: Omit<Player, 'id'>): Observable<string> {
    let tmpId: string | null = null;
    try {
      tmpId = `tmp-${Date.now()}`;
      const tmpPlayer: any = {
        id: tmpId,
        ...player,
        createdAt: new Date()
      };
      this.playersSubject.next([...this.playersSubject.value, tmpPlayer]);
    } catch (e) {
      tmpId = null;
    }

    const sanitize = (v: any): any => {
      if (v === undefined) return undefined;
      if (v === null) return null;
      if (Array.isArray(v)) return v.map(sanitize).filter(x => x !== undefined);
      if (v instanceof Date) return v;
      if (v && typeof v === 'object') {
        const out: any = {};
        Object.entries(v).forEach(([k, val]) => {
          const s = sanitize(val);
          if (s !== undefined) out[k] = s;
        });
        return out;
      }
      return v;
    };

    const dataToSend: any = sanitize(player) || {};
    if ('clanId' in dataToSend && dataToSend.clanId === undefined) delete dataToSend.clanId;
    dataToSend.createdAt = serverTimestamp();

    return from(
      addDoc(collection(db, 'players'), dataToSend)
    ).pipe(
      map(docRef => docRef.id),
      tap(id => console.log('Hráč pridaný s ID:', id)),
      tap(id => {
        if (tmpId) {
          const current = this.playersSubject.value.slice();
          const idx = current.findIndex((p: any) => p.id === tmpId);
          if (idx !== -1) {
            current[idx] = { id: id, ...(player as any), createdAt: new Date() };
            this.playersSubject.next(current);
          }
        }
      }),
      catchError(err => {
        if (tmpId) {
          this.playersSubject.next(this.playersSubject.value.filter(p => (p as any).id !== tmpId));
        }
        return throwError(() => err);
      })
    );
  }

  deletePlayer(id: string): Observable<void> {
    return from(deleteDoc(doc(db, 'players', id))).pipe(
      tap(() => console.log('Hráč vymazaný s ID:', id))
    );
  }

  updatePlayer(id: string, data: Partial<Player>): Observable<void> {
    const updateData: any = { ...data };
    if ('clanId' in data && data.clanId === undefined) {
      updateData.clanId = deleteField();
    }
    return from(updateDoc(doc(db, 'players', id), updateData)).pipe(
      tap(() => console.log('Hráč aktualizovaný s ID:', id))
    );
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
