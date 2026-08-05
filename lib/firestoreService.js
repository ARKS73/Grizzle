import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ========================
// 1. PRODUCTS COLLECTION
// ========================
export async function getFirestoreProducts(categoryFilter = null) {
  try {
    const productsRef = collection(db, 'products');
    let q = query(productsRef, orderBy('createdAt', 'desc'));

    if (categoryFilter && categoryFilter !== 'ALL') {
      q = query(productsRef, where('category', '==', categoryFilter), orderBy('createdAt', 'desc'));
    }

    const snapshot = await getDocs(q);
    const products = snapshot.docs.map((d) => ({
      _id: d.id,
      id: d.id,
      ...d.data(),
    }));

    return { success: true, products };
  } catch (error) {
    console.error('Firestore getProducts Error:', error);
    return { success: false, products: [], message: error.message };
  }
}

export async function getFirestoreProductById(productId) {
  try {
    const docRef = doc(db, 'products', productId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { success: true, product: { _id: docSnap.id, id: docSnap.id, ...docSnap.data() } };
    }
    return { success: false, message: 'Product not found in Firestore' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function saveFirestoreProduct(productData) {
  try {
    const productsRef = collection(db, 'products');
    const docRef = await addDoc(productsRef, {
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// ========================
// 2. ORDERS COLLECTION
// ========================
export async function createFirestoreOrder(orderData) {
  try {
    const ordersRef = collection(db, 'orders');
    const docRef = await addDoc(ordersRef, {
      ...orderData,
      status: 'Processing',
      createdAt: new Date().toISOString(),
    });
    return { success: true, orderId: docRef.id };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function getUserFirestoreOrders(userId) {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map((d) => ({ _id: d.id, id: d.id, ...d.data() }));

    return { success: true, orders };
  } catch (error) {
    return { success: false, orders: [], message: error.message };
  }
}

// ========================
// 3. USER PROFILE SYNC
// ========================
export async function syncFirestoreUser(uid, userData) {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(
      userRef,
      {
        ...userData,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
