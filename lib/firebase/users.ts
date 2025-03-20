// lib/users.ts
import { collection, addDoc, updateDoc, deleteDoc, getDocs, query, where, serverTimestamp, doc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'user';

export interface UserData {
  username: string;
  password: string;
  isAllowed: boolean;
  role: UserRole;
  createdAt?: any;
  updatedAt?: any;
  isDeleted?: boolean;
  deletedAt?: any;
}

export const usersCollection = collection(firestore, "Users");

export const createUser = async (
  username: string,
  password: string,
  options: { 
    isAllowed?: boolean;
    role?: UserRole;
  } = {}
) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return await addDoc(usersCollection, {
    username,
    password: hashedPassword,
    isAllowed: options.isAllowed ?? true,
    role: options.role ?? 'user',
    createdAt: serverTimestamp(),
    isDeleted: false,
  });
};

export const updateUser = async (
  userId: string,
  data: Partial<{
    username: string;
    password: string;
    isAllowed: boolean;
    role: UserRole;
  }>
) => {
  const userRef = doc(usersCollection, userId);
  const updateData: any = { ...data, updatedAt: serverTimestamp() };
  
  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }
  
  return await updateDoc(userRef, updateData);
};

export const deleteUser = async (userId: string) => {
  const userRef = doc(usersCollection, userId);
  return await updateDoc(userRef, { 
    isDeleted: true, 
    deletedAt: serverTimestamp() 
  });
};

export const getUserByUsername = async (username: string) => {
  const q = query(
    usersCollection,
    where("username", "==", username),
    where("isDeleted", "==", false)
  );
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    const userDoc = querySnapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() } as UserData & { id: string };
  }
  return null;
};

// Optional: Get all users (useful for the UserManagement component)
export const getAllUsers = async () => {
  const q = query(usersCollection, where("isDeleted", "==", false));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as (UserData & { id: string })[];
};