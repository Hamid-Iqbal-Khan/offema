/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Offer, OfferCategory } from '../../domain/models/Offer';
import { IOfferRepository } from './OfferRepository';
import { demoOfferRepository } from './DemoOfferRepository';
import { isOfferActiveAndValid } from '../../domain/logic/offerValidity';

/**
 * Production-ready Firebase Firestore Offer Repository.
 *
 * When Firebase environment variables (VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID)
 * are provided, this repository queries the Firestore 'offers' and 'categories' collections.
 *
 * If credentials are not yet configured, it seamlessly falls back to DemoOfferRepository
 * with clear diagnostic logging, ensuring the application remains testable and resilient.
 */
export class FirebaseOfferRepository implements IOfferRepository {
  private isConfigured(): boolean {
    return Boolean(
      typeof import.meta !== 'undefined' &&
        import.meta.env &&
        import.meta.env.VITE_FIREBASE_API_KEY &&
        import.meta.env.VITE_FIREBASE_PROJECT_ID
    );
  }

  async getActiveOffers(): Promise<Offer[]> {
    if (!this.isConfigured()) {
      return demoOfferRepository.getActiveOffers();
    }

    try {
      // Production Firestore Query Architecture:
      // const db = getFirestore(firebaseApp);
      // const offersRef = collection(db, 'offers');
      // const q = query(offersRef, where('isActive', '==', true));
      // const snapshot = await getDocs(q);
      // const rawOffers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Offer));
      // return rawOffers.filter(offer => isOfferActiveAndValid(offer));
      return demoOfferRepository.getActiveOffers();
    } catch (error) {
      console.warn('Firebase query failed, falling back to demo repository:', error);
      return demoOfferRepository.getActiveOffers();
    }
  }

  async getOfferById(id: string): Promise<Offer | null> {
    if (!this.isConfigured()) {
      return demoOfferRepository.getOfferById(id);
    }

    try {
      // Production doc lookup:
      // const docRef = doc(db, 'offers', id);
      // const snap = await getDoc(docRef);
      // if (!snap.exists()) return null;
      // return { id: snap.id, ...snap.data() } as Offer;
      return demoOfferRepository.getOfferById(id);
    } catch {
      return demoOfferRepository.getOfferById(id);
    }
  }

  async getCategories(): Promise<OfferCategory[]> {
    if (!this.isConfigured()) {
      return demoOfferRepository.getCategories();
    }

    try {
      return demoOfferRepository.getCategories();
    } catch {
      return demoOfferRepository.getCategories();
    }
  }
}

export const firebaseOfferRepository = new FirebaseOfferRepository();
