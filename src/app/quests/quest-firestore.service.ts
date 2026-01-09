import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc,
  onSnapshot,
  updateDoc,
  Query,
  QuerySnapshot
} from 'firebase/firestore';
import { db } from '../firebase.config';

export type Quest = {
  id: string;
  title: string;
  description: string;
  xp: number;
  createdAt?: Date;
};

@Injectable({
  providedIn: 'root'
})
export class QuestFirestoreService {
  private questsSubject = new BehaviorSubject<Quest[]>([]);
  quests$ = this.questsSubject.asObservable();
  private unsubscribe: (() => void) | null = null;

  constructor() {
    this.loadQuestsFromFirestore();
  }

  /**
   * Načíta questy z Firestore v reálnom čase
   */
  private loadQuestsFromFirestore() {
    const questsCollection = collection(db, 'quests');
    
    // Real-time listener s onSnapshot
    this.unsubscribe = onSnapshot(questsCollection, (snapshot: QuerySnapshot) => {
      const quests: Quest[] = [];
      snapshot.forEach((doc) => {
        quests.push({
          id: doc.id,
          ...doc.data()
        } as Quest);
      });
      this.questsSubject.next(quests);
    }, (error) => {
      console.error('Chyba pri načítaní questov z Firestore:', error);
    });
  }

  /**
   * Vráti Observable s aktuálnymi questami
   */
  getQuests$(): Observable<Quest[]> {
    return this.quests$;
  }

  /**
   * Vráti synchronný array questov
   */
  getQuests(): Quest[] {
    return this.questsSubject.value;
  }

  /**
   * Vráti konkrétny quest podľa ID
   */
  getQuestById(id: string): Observable<Quest | undefined> {
    return this.quests$.pipe(
      map(quests => quests.find(q => q.id === id))
    );
  }

  /**
   * Pridá nový quest do Firestore
   */
  addQuest(quest: Omit<Quest, 'id'>): Observable<string> {
    return from(
      addDoc(collection(db, 'quests'), {
        ...quest,
        createdAt: new Date()
      })
    ).pipe(
      map(docRef => docRef.id),
      tap(id => console.log('Quest pridaný s ID:', id))
    );
  }

  /**
   * Aktualizuje quest v Firestore
   */
  updateQuest(id: string, data: Partial<Quest>): Observable<void> {
    return from(updateDoc(doc(db, 'quests', id), data)).pipe(
      tap(() => console.log('Quest aktualizovaný s ID:', id))
    );
  }

  /**
   * Vymaže quest z Firestore
   */
  deleteQuest(id: string): Observable<void> {
    return from(deleteDoc(doc(db, 'quests', id))).pipe(
      tap(() => console.log('Quest vymazaný s ID:', id))
    );
  }

  /**
   * Destruktor - zastavenie real-time listenera
   */
  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
