import { initializeApp, getApps } from 'firebase/app';
import { getAuth, User } from 'firebase/auth';
import { addDoc, arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, getFirestore, query, setDoc, updateDoc, where } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// User functions
export const createUserDocument = async (user: User) => {
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      avatar: user.photoURL || '',
      createdAt: new Date(),
      lastLoginAt: new Date(),
      repositoriesOwned: 0,
      repositoriesShared: 0,
    });
  } else {
    // Update last login
    await updateDoc(userRef, {
      lastLoginAt: new Date(),
    });
  }
};

export const getUserByEmail = async (email: string): Promise<any> => {
  const q = query(collection(db, 'users'), where('email', '==', email));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const userDoc = querySnapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() };
  }

  return null;
};

export const getUserById = async (uid: string): Promise<any> => {
  const userRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    return { id: userDoc.id, ...userDoc.data() };
  }

  return null;
};

export const updateUserProfile = async (uid: string, updates: Partial<{
  displayName: string;
  avatar: string;
  email: string;
}>) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: new Date(),
  });
};

export const updateUserStats = async (uid: string, stats: {
  repositoriesOwned?: number;
  repositoriesShared?: number;
}) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, stats);
};

export const createRepository = async (userId: string, name: string, description: string) => {
  const slug = name.toLowerCase().replace(/\s+/g, '-');

  // Create a new repository document
  const docRef = await addDoc(collection(db, "repositories"), {
    name,
    slug,
    description,
    ownerId: userId,
    collaborators: [],
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Update user's repositories owned count
  const user = await getUserById(userId);
  if (user) {
    await updateUserStats(userId, {
      repositoriesOwned: (user.repositoriesOwned || 0) + 1,
    });
  }

  return docRef.id;
};

// Updated repository functions with user validation
export const addCollaborator = async (repoId: string, collaboratorEmail: string) => {
  // First validate that the collaborator exists
  const collaborator = await getUserByEmail(collaboratorEmail);
  if (!collaborator) {
    throw new Error('User with this email does not exist');
  }

  const repoRef = doc(db, 'repositories', repoId);

  await updateDoc(repoRef, {
    collaborators: arrayUnion(collaboratorEmail),
    updatedAt: new Date(),
  });

  // Update collaborator's shared repositories count
  await updateUserStats(collaborator.uid, {
    repositoriesShared: (collaborator.repositoriesShared || 0) + 1,
  });
};

export const removeCollaborator = async (repoId: string, collaboratorEmail: string) => {
  const repoRef = doc(db, 'repositories', repoId);

  await updateDoc(repoRef, {
    collaborators: arrayRemove(collaboratorEmail),
    updatedAt: new Date(),
  });

  // Update collaborator's shared repositories count
  const collaborator = await getUserByEmail(collaboratorEmail);
  if (collaborator) {
    await updateUserStats(collaborator.uid, {
      repositoriesShared: Math.max(0, (collaborator.repositoriesShared || 0) - 1),
    });
  }
};

export { app, auth, db }; 