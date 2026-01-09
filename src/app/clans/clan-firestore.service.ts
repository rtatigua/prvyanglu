import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
  QuerySnapshot
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { from } from 'rxjs';

export type Clan = {
  id: string;
  name: string;
  description: string;
  capacity: number;
  members?: string[] | any[];  // IDs alebo Player objects
  createdAt?: Date;
};

@Injectable({
  providedIn: 'root'
})
export class ClanFirestoreService {
  private clansSubject = new BehaviorSubject<Clan[]>([]);
  clans$ = this.clansSubject.asObservable();
  private unsubscribe: (() => void) | null = null;

  constructor() {
    this.loadClansFromFirestore();
  }

  /**
   * Pridá hráča do poľa members v dokumente klanu
   */
  addMember(clanId: string, playerId: string) {
    return from(updateDoc(doc(db, 'clans', clanId), {
      members: arrayUnion(playerId)
    })).pipe(
      tap(() => console.log(`Player ${playerId} added to clan ${clanId}`))
    );
  }

  /**
   * Odstráni hráča z poľa members v dokumente klanu
   */
  removeMember(clanId: string, playerId: string) {
    return from(updateDoc(doc(db, 'clans', clanId), {
      members: arrayRemove(playerId)
    })).pipe(
      tap(() => console.log(`Player ${playerId} removed from clan ${clanId}`))
    );
  }

  /**
   * Načíta klany z Firestore v reálnom čase
   */
  private loadClansFromFirestore() {
    const clansCollection = collection(db, 'clans');
    
    this.unsubscribe = onSnapshot(clansCollection, (snapshot: QuerySnapshot) => {
      const clans: Clan[] = [];
      snapshot.forEach((doc) => {
        clans.push({
          id: doc.id,
          ...doc.data()
        } as Clan);
      });
      this.clansSubject.next(clans);
    }, (error) => {
      console.error('Chyba pri načítaní klanov z Firestore:', error);
    });
  }

  /**
   * Vráti Observable s aktuálnymi klanmi
   */
  getClans$(): Observable<Clan[]> {
    return this.clans$;
  }

  /**
   * Vráti synchronný array klanov
   */
  getClans(): Clan[] {
    return this.clansSubject.value;
  }

  /**
   * Pridá nový klan do Firestore
   */
  addClan(clan: Omit<Clan, 'id'>): Observable<string> {
    return from(
      addDoc(collection(db, 'clans'), {
        ...clan,
        members: [],
        createdAt: new Date()
      })
    ).pipe(
      map(docRef => docRef.id),
      tap(id => console.log('Klan pridaný s ID:', id))
    );
  }

  /**
   * Vymaže klan z Firestore
   */
  deleteClan(id: string): Observable<void> {
    return from(deleteDoc(doc(db, 'clans', id))).pipe(
      tap(() => console.log('Klan vymazaný s ID:', id))
    );
  }

  /**
   * Aktualizuje klan v Firestore
   */
  updateClan(id: string, data: Partial<Clan>): Observable<void> {
    return from(updateDoc(doc(db, 'clans', id), data)).pipe(
      tap(() => console.log('Klan aktualizovaný s ID:', id))
    );
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
