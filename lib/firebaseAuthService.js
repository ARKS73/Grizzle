import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

// 1. Email & Password Signup
export async function signUpWithEmail(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();
    return { success: true, user: userCredential.user, idToken };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// 2. Email & Password Login
export async function loginWithEmail(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();
    return { success: true, user: userCredential.user, idToken };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// 3. Google Sign-In Popup
export async function loginWithGooglePopup() {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const idToken = await userCredential.user.getIdToken();
    return { success: true, user: userCredential.user, idToken };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// 4. Initialize Phone Auth Recaptcha Verifier
export function setupRecaptcha(containerId = 'recaptcha-container') {
  if (typeof window === 'undefined') return null;
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      containerId,
      {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
      }
    );
  }
  return window.recaptchaVerifier;
}

// 5. Send Phone SMS OTP
export async function sendPhoneOtp(phoneNumber, recaptchaVerifier) {
  try {
    // Ensure +91 country code formatting
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber.replace(/\D/g, '')}`;
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
    return { success: true, confirmationResult };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// 6. Confirm Phone SMS OTP Code
export async function confirmPhoneOtp(confirmationResult, otpCode) {
  try {
    const userCredential = await confirmationResult.confirm(otpCode);
    const idToken = await userCredential.user.getIdToken();
    return { success: true, user: userCredential.user, idToken };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// 7. Logout Firebase Auth
export async function logoutFirebaseAuth() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
