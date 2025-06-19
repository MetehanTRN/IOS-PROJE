// firebaseConfig.ts – Firebase bağlantı ve servis ayarları

// Firebase ana uygulama başlatma
import { initializeApp } from 'firebase/app';

// Firestore veritabanı için
import { getFirestore } from 'firebase/firestore';

// Firebase Storage (görsel, dosya vs. yüklemek için)
import { getStorage } from 'firebase/storage';

// Firebase projenin yapılandırma bilgileri
const firebaseConfig = {
  apiKey: "AIzaSyCF0dhT_20J8YBVBCDQ3NGjuHWMgvcG2GOA",                  // Kimlik doğrulama anahtarı
  authDomain: "plate-recognition-system-15ee8.firebaseapp.com",        // Yetkili alan
  projectId: "plate-recognition-system-15ee8",                         // Proje ID
  storageBucket: "plate-recognition-system-15ee8.appspot.com",         // Storage bucket
  messagingSenderId: "987248740857",                                   // Mesajlaşma ID
  appId: "1:987248740057:web:264d2491a06f17c6d260c8",                   // Uygulama ID
  measurementId: "G-3MZHNt65GC"                                        // Analitik için opsiyonel ölçüm ID
};

// Firebase uygulamasını başlat
const app = initializeApp(firebaseConfig);

// Firestore ve Storage servisini başlat
const db = getFirestore(app);
const storage = getStorage(app);

// Diğer dosyaların kullanabilmesi için dışa aktar
export { db, storage };
