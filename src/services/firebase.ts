import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAV1ZkTG7nnjgNaNZURLe6He6P2JcUqwF0',
  authDomain: 'kingoversized-33086.firebaseapp.com',
  projectId: 'kingoversized-33086',
  storageBucket: 'kingoversized-33086.firebasestorage.app',
  messagingSenderId: '373933043831',
  appId: '1:373933043831:web:ad37f588db3add1db7d672',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const ADMIN_EMAIL = 'kingoversized@gmail.com';
