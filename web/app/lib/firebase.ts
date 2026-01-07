
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, collection, addDoc, query, where, getDocs, doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth functions
export const signUp = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signIn = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signOut = async () => {
  return firebaseSignOut(auth);
};

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Repository functions
export const createRepository = async (userId: string, name: string, description: string) => {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  
  // Create a new repository document
  await setDoc(doc(db, "repositories", `${userId}_${slug}`), {
    name,
    slug,
    description,
    owner: userId,
    collaborators: [],
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  return slug;
};

export const getUserRepositories = async (userId: string) => {
  const repositories: any[] = [];
  
  // Get repositories where user is owner
  const ownerQuery = query(collection(db, "repositories"), where("owner", "==", userId));
  const ownerSnapshot = await getDocs(ownerQuery);
  
  ownerSnapshot.forEach((doc) => {
    repositories.push({ id: doc.id, ...doc.data() });
  });
  
  // Get repositories where user is a collaborator
  const collabQuery = query(collection(db, "repositories"), where("collaborators", "array-contains", userId));
  const collabSnapshot = await getDocs(collabQuery);
  
  collabSnapshot.forEach((doc) => {
    repositories.push({ id: doc.id, ...doc.data() });
  });
  
  return repositories;
};

export const getRepositoryBySlug = async (userId: string, slug: string) => {
  const repoRef = doc(db, "repositories", `${userId}_${slug}`);
  const repoDoc = await getDoc(repoRef);
  
  if (repoDoc.exists()) {
    return { id: repoDoc.id, ...repoDoc.data() };
  }
  
  return null;
};

export const addCollaborator = async (repoId: string, userId: string) => {
  const repoRef = doc(db, "repositories", repoId);
  
  await updateDoc(repoRef, {
    collaborators: arrayUnion(userId),
    updatedAt: new Date()
  });
};
