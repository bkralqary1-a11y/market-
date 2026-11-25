import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  GoogleAuthProvider,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence,
  browserPopupRedirectResolver,
  type Auth,
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDocFromServer,
  enableNetwork,
  type Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { sha256Hex } from './utils/urlSecurity';

// Salted SHA-256 digest of the verified owner identity (never stored in plaintext in client bundle;
// authoritative access control is enforced server-side by Firestore Security Rules)
const OWNER_IDENTITY_SALT = 'saddam-store-owner-v1:';
const OWNER_IDENTITY_DIGEST =
  '0db35d5bc9de597cd4d09bb0afe97d7914c7ab8268b37e9482ff234bac9ae5ab';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Connect specifically to the provisioned named Firestore database with forced HTTPS long-polling
// and a 20s timeout so mobile ISPs, strict proxies, and VPNs never stall on persistent WebChannel streams
let dbInstance: Firestore;
try {
  dbInstance = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true,
      experimentalLongPollingOptions: { timeoutSeconds: 20 },
      ignoreUndefinedProperties: true,
    },
    firebaseConfig.firestoreDatabaseId
  );
} catch {
  dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}
export const db = dbInstance;

// Automatically restore Firestore network transport when device regains connectivity
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    enableNetwork(db).catch(() => {
      // ignore transient reconnect error
    });
  });
}

// Initialize Auth with resilient persistence fallback for mobile browsers & embedded iframes
let authInstance: Auth;
try {
  authInstance = initializeAuth(app, {
    persistence: [
      indexedDBLocalPersistence,
      browserLocalPersistence,
      browserSessionPersistence,
      inMemoryPersistence,
    ],
    popupRedirectResolver: browserPopupRedirectResolver,
  });
} catch {
  authInstance = getAuth(app);
}

export const auth = authInstance;
export const popupRedirectResolver = browserPopupRedirectResolver;

export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData.map((provider) => ({
          providerId: provider.providerId,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function isOwnerEmailCandidate(email: string | null | undefined): boolean {
  if (!email) return false;
  return sha256Hex(OWNER_IDENTITY_SALT + email.trim().toLowerCase()) === OWNER_IDENTITY_DIGEST;
}

export function isVerifiedAdminUser(
  user: { email?: string | null; emailVerified?: boolean } | null
): boolean {
  if (!user) return false;
  return Boolean(user.emailVerified && isOwnerEmailCandidate(user.email));
}

// Required startup connection test to verify Firestore reachability (retries once on transient hiccup)
async function testConnection(retryAttempt = 0): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return;
  }
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      if (retryAttempt === 0) {
        setTimeout(() => {
          void testConnection(1);
        }, 2500);
        return;
      }
      console.error('Please check your Firebase configuration.');
    }
  }
}

void testConnection();
