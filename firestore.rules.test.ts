/**
 * Security Rules Verification Spec — Dirty Dozen Test Matrix
 * Intended to be executed against the Firestore Emulator with @firebase/rules-unit-testing.
 */

export interface SecurityTestCase {
  id: number;
  name: string;
  actor: 'anonymous' | 'customer_verified' | 'admin_unverified' | 'admin_verified';
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED' | 'ALLOWED';
}

export const DIRTY_DOZEN_TESTS: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Anonymous visitor cannot create product',
    actor: 'anonymous',
    operation: 'create',
    path: '/products/hack-1',
    payload: { id: 'hack-1', name: 'Fake' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Verified customer cannot delete product',
    actor: 'customer_verified',
    operation: 'delete',
    path: '/products/prod-user-a32-case',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Unverified admin email spoof rejected on siteConfig write',
    actor: 'admin_unverified',
    operation: 'update',
    path: '/siteConfig/main',
    payload: { storeNameAr: 'Hacked' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Client cannot self-assign admin document',
    actor: 'customer_verified',
    operation: 'create',
    path: '/admins/attacker-uid',
    payload: { email: 'attacker@example.com', role: 'admin' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Shadow field rejected on product create',
    actor: 'admin_verified',
    operation: 'create',
    path: '/products/prod-shadow',
    payload: { id: 'prod-shadow', ghostField: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Invalid document ID characters rejected',
    actor: 'admin_verified',
    operation: 'create',
    path: '/products/bad!id@space',
    payload: { id: 'bad!id@space' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Oversized nameAr string rejected',
    actor: 'admin_verified',
    operation: 'create',
    path: '/products/prod-overflow',
    payload: { nameAr: 'x'.repeat(250) },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Non-string element in images array rejected',
    actor: 'admin_verified',
    operation: 'create',
    path: '/products/prod-bad-array',
    payload: { images: [12345] },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Client-forged createdAt timestamp rejected',
    actor: 'admin_verified',
    operation: 'create',
    path: '/products/prod-bad-time',
    payload: { createdAt: '2020-01-01T00:00:00Z' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Mutating immutable createdAt rejected on update',
    actor: 'admin_verified',
    operation: 'update',
    path: '/products/prod-user-a32-case',
    payload: { createdAt: 'request.time' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Writing arbitrary siteConfig document ID rejected',
    actor: 'admin_verified',
    operation: 'create',
    path: '/siteConfig/rogue',
    payload: { storeNameAr: 'Rogue' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Non-admin cannot read or list admins collection',
    actor: 'customer_verified',
    operation: 'list',
    path: '/admins',
    expected: 'PERMISSION_DENIED',
  },
];
