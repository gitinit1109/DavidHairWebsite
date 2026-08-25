import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection as fbCollection, 
  doc as fbDoc, 
  setDoc as fbSetDoc, 
  deleteDoc as fbDeleteDoc, 
  getDocs as fbGetDocs, 
  query as fbQuery, 
  orderBy as fbOrderBy, 
  onSnapshot as fbOnSnapshot,
  getDocFromServer,
  where as fbWhere
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified?: boolean;
  isAnonymous?: boolean;
  tenantId?: string | null;
  providerData?: {
    providerId?: string | null;
    email?: string | null;
  }[];
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */

// Define Auth Change Callbacks
type AuthCallback = (user: User | null) => void;
const authCallbacks = new Set<AuthCallback>();

let localCurrentUser: User | null = null;
try {
  const savedUser = localStorage.getItem('david_logged_in_user');
  if (savedUser) {
    localCurrentUser = JSON.parse(savedUser);
  }
} catch (e) {
  console.error("Failed to parse saved user:", e);
}

function triggerAuthChange() {
  authCallbacks.forEach(cb => {
    try {
      cb(localCurrentUser);
    } catch (e) {
      console.error("Auth callback failed", e);
    }
  });
}

export const auth = {
  get currentUser() {
    return localCurrentUser;
  },
  onAuthStateChanged(callback: AuthCallback) {
    authCallbacks.add(callback);
    callback(localCurrentUser);
    return () => {
      authCallbacks.delete(callback);
    };
  }
};

export function onAuthStateChanged(authInstance: any, callback: AuthCallback) {
  authCallbacks.add(callback);
  callback(localCurrentUser);
  return () => {
    authCallbacks.delete(callback);
  };
}

// Google Authentication - local simulation
export async function loginWithGoogle(emailArg?: string) {
  const email = emailArg || 'hankyleisplay@gmail.com';
  const name = email.split('@')[0];
  const mappedUser: User = {
    uid: "google_local_" + name + "_" + Date.now().toString().slice(-6),
    email: email,
    displayName: name.charAt(0).toUpperCase() + name.slice(1),
    emailVerified: true
  };
  localCurrentUser = mappedUser;
  localStorage.setItem('david_logged_in_user', JSON.stringify(mappedUser));
  triggerAuthChange();
  return mappedUser;
}

// Admin Password login (David / hairdavidpro)
export async function loginWithAdminCredentials(username: string, envPasswordArg: string) {
  if (username.toLowerCase() !== 'david' || envPasswordArg !== 'hairdavidpro') {
    throw new Error("帳號或密碼錯誤，請重新輸入！");
  }
  const mockUser: User = {
    uid: "admin_david_999",
    email: "david@davidhair.com",
    displayName: "大衛哥",
    emailVerified: true
  };
  localCurrentUser = mockUser;
  localStorage.setItem('david_logged_in_user', JSON.stringify(mockUser));
  triggerAuthChange();
  return mockUser;
}

// Member email/password registration
export async function registerMember(displayName: string, email: string, phone: string, passwordArg: string) {
  const emailLower = email.toLowerCase().trim();
  
  // Check if member already exists
  const colRef = fbCollection(db, 'members');
  const q = fbQuery(colRef, fbWhere('email', '==', emailLower));
  const snapshot = await fbGetDocs(q);
  
  if (snapshot && !snapshot.empty) {
    throw new Error("此電子信箱已被註冊！");
  }
  
  const uid = "member_" + Date.now().toString() + "_" + Math.random().toString(36).substring(2, 6);
  const newMember: User = {
    uid: uid,
    email: emailLower,
    displayName: displayName,
    emailVerified: true
  };
  
  const payload = {
    uid: uid,
    displayName: displayName,
    email: emailLower,
    phone: phone.trim(),
    password: passwordArg,
    createdAt: new Date().toISOString()
  };
  
  // Save to firestore
  const docRef = fbDoc(db, 'members', uid);
  await fbSetDoc(docRef, payload);
  
  // Log in
  localCurrentUser = newMember;
  localStorage.setItem('david_logged_in_user', JSON.stringify(newMember));
  triggerAuthChange();
  
  return newMember;
}

// Member email/password login
export async function loginMember(email: string, passwordArg: string) {
  const emailLower = email.toLowerCase().trim();
  
  const colRef = fbCollection(db, 'members');
  const q = fbQuery(colRef, fbWhere('email', '==', emailLower));
  const snapshot = await fbGetDocs(q);
  
  if (!snapshot || snapshot.empty) {
    throw new Error("該信箱尚未註冊會員！");
  }
  
  // Find correct match
  let foundDoc: any = null;
  snapshot.forEach((d: any) => {
    const data = d.data();
    if (data.password === passwordArg) {
      foundDoc = data;
    }
  });
  
  if (!foundDoc) {
    throw new Error("密碼不正確，請重新輸入！");
  }
  
  const mappedUser: User = {
    uid: foundDoc.uid,
    email: foundDoc.email,
    displayName: foundDoc.displayName,
    emailVerified: true
  };
  
  localCurrentUser = mappedUser;
  localStorage.setItem('david_logged_in_user', JSON.stringify(mappedUser));
  triggerAuthChange();
  
  return mappedUser;
}

// Log out
export async function logoutUser() {
  localCurrentUser = null;
  localStorage.removeItem('david_logged_in_user');
  triggerAuthChange();
}

export interface RegisteredMember {
  uid: string;
  displayName: string;
  email: string;
  phone: string;
  createdAt: string;
}

// Fetch all registered members (Admin only view)
export async function getMembersList(): Promise<RegisteredMember[]> {
  const path = 'members';
  try {
    const colRef = fbCollection(db, path);
    const q = fbQuery(colRef, fbOrderBy('createdAt', 'desc'));
    const snapshot = await fbGetDocs(q);
    const members: RegisteredMember[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      members.push({
        uid: data.uid,
        displayName: data.displayName || '',
        email: data.email || '',
        phone: data.phone || '',
        createdAt: data.createdAt || ''
      });
    });
    return members;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

// Delete a registered member by UID
export async function deleteMember(uid: string): Promise<void> {
  const path = `members/${uid}`;
  try {
    const docRef = fbDoc(db, 'members', uid);
    await fbDeleteDoc(docRef);
    
    // If the deleted member is the current logged in user, log them out
    if (localCurrentUser && localCurrentUser.uid === uid) {
      localCurrentUser = null;
      localStorage.removeItem('david_logged_in_user');
      triggerAuthChange();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Firestore operations proxies
export function collection(dbInstance: any, path: string) {
  return fbCollection(dbInstance, path);
}

export function doc(dbInstance: any, path: string, id?: string) {
  if (id) {
    return fbDoc(dbInstance, path, id);
  }
  return fbDoc(dbInstance, path);
}

export function query(colRef: any, ...args: any[]) {
  return fbQuery(colRef, ...args);
}

export function orderBy(field: string, direction?: 'asc' | 'desc') {
  return fbOrderBy(field, direction);
}

export async function getDocs(queryRef: any): Promise<any> {
  try {
    return await fbGetDocs(queryRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, queryRef?.path || 'getDocs');
  }
}

export async function setDoc(docRef: any, payload: any) {
  try {
    return await fbSetDoc(docRef, payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, docRef?.path || 'setDoc');
  }
}

export async function deleteDoc(docRef: any) {
  try {
    return await fbDeleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, docRef?.path || 'deleteDoc');
  }
}

export function onSnapshot(
  ref: any, 
  onNext: (snapshot: any) => void, 
  onError?: (err: any) => void
) {
  const path = ref?.path || 'onSnapshot';
  return fbOnSnapshot(
    ref, 
    onNext, 
    (error) => {
      if (onError) {
        onError(error);
      } else {
        handleFirestoreError(error, OperationType.GET, path);
      }
    }
  );
}

// Initialize Firestore instance cleanly
export { getFirestore };

export interface DbOrder {
  id: string;
  userId: string;
  userEmail: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  paymentMethod: string;
  items: {
    productId: string;
    title: string;
    quantity: number;
    price: number;
    selectedSize: string;
    selectedColor: string;
  }[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  createdAt: string;
}

// Order Management database APIs
export async function createDbOrder(orderData: Omit<DbOrder, 'id' | 'createdAt' | 'status'>): Promise<DbOrder> {
  const orderId = 'order_' + Date.now().toString() + '_' + Math.random().toString(36).substring(2, 6);
  const path = `orders/${orderId}`;
  const newOrder: DbOrder = {
    ...orderData,
    id: orderId,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  try {
    const docRef = fbDoc(db, 'orders', orderId);
    await fbSetDoc(docRef, newOrder);
    return newOrder;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export async function getUserOrders(userId: string): Promise<DbOrder[]> {
  const path = 'orders';
  try {
    const colRef = fbCollection(db, path);
    const q = fbQuery(colRef, fbWhere('userId', '==', userId));
    const snapshot = await fbGetDocs(q);
    const orders: DbOrder[] = [];
    snapshot.forEach((doc: any) => {
      orders.push(doc.data() as DbOrder);
    });
    // Sort manually by createdAt desc
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function getAllOrders(): Promise<DbOrder[]> {
  const path = 'orders';
  try {
    const colRef = fbCollection(db, path);
    const q = fbQuery(colRef, fbOrderBy('createdAt', 'desc'));
    const snapshot = await fbGetDocs(q);
    const orders: DbOrder[] = [];
    snapshot.forEach((doc: any) => {
      orders.push(doc.data() as DbOrder);
    });
    return orders;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function updateOrderStatus(orderId: string, status: DbOrder['status']): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    const docRef = fbDoc(db, 'orders', orderId);
    await fbSetDoc(docRef, { status }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

export async function deleteOrder(orderId: string): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    const docRef = fbDoc(db, 'orders', orderId);
    await fbDeleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}
