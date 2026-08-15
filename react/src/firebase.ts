import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getPerformance } from 'firebase/performance';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'unspecified',
  authDomain: 'tool-dkhp-uit.firebaseapp.com',
  projectId: 'tool-dkhp-uit',
  storageBucket: 'tool-dkhp-uit.appspot.com',
  messagingSenderId: '473962295838',
  appId: '1:473962295838:web:24fcf634d9eee42d2db40f',
};

export const app = initializeApp(firebaseConfig, { automaticDataCollectionEnabled: true });
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
getPerformance(app);
