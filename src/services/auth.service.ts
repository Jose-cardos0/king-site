import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';

export interface KingUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phone?: string;
  createdAt?: unknown;
}

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string
) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  await upsertUserDoc(cred.user, { displayName });
  return cred.user;
}

export async function loginWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  await upsertUserDoc(cred.user);
  return cred.user;
}

export async function loginWithGoogle() {
  const cred = await signInWithPopup(auth, googleProvider);
  await upsertUserDoc(cred.user);
  return cred.user;
}

export async function logout() {
  await signOut(auth);
}

export async function upsertUserDoc(
  user: User,
  extra: Partial<KingUser> = {}
) {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email,
      displayName: extra.displayName ?? user.displayName,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
      ...extra,
    });
  } else {
    await setDoc(
      ref,
      {
        email: user.email,
        displayName: extra.displayName ?? user.displayName ?? snap.data().displayName,
        photoURL: user.photoURL ?? snap.data().photoURL,
        ...extra,
      },
      { merge: true }
    );
  }
}
