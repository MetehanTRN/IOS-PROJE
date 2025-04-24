// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase projenin konfigürasyonu
const firebaseConfig = {
  apiKey: "AIzaSyCF0dhT_20J8YBVBCDQ3NGjuHWMgvcG2GOA",
  authDomain: "plate-recognition-system-15ee8.firebaseapp.com",
  projectId: "plate-recognition-system-15ee8",
  storageBucket: "plate-recognition-system-15ee8.appspot.com",
  messagingSenderId: "987248740857",
  appId: "1:987248740857:web:26d4d2491a06f17c6d620c8",
  measurementId: "G-3MZHNt65GC"
};

// Firebase uygulamasını başlat
const app = initializeApp(firebaseConfig);

// Firestore veritabanını başlat
const db = getFirestore(app);

export { db };
