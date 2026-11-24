# Security Specification — Saddam Al-Aqari Storefront & Admin Console

## 1. Data Invariants
1. **Default Deny**: Any path not explicitly matched is completely inaccessible (`allow read, write: if false`).
2. **Read-Only Public Catalog**: Anonymous and signed-in customers can ONLY read `/products/{productId}`, `/heroSlides/{slideId}`, and `/siteConfig/main`. They can NEVER create, update, or delete any document.
3. **Verified Admin Only**: Writes to `/products`, `/heroSlides`, and `/siteConfig` require `request.auth != null`, `request.auth.token.email_verified == true`, and either the verified owner email (`bkralqary1@gmail.com`) or an existing `/admins/$(request.auth.uid)` record.
4. **Immutable Admin Allowlist**: `/admins/{adminUid}` can NEVER be created, modified, or deleted from the client SDK, eliminating self-assigned privilege escalation.
5. **Strict Schema & Size Guards**: Every document write validates `isValidId()` on the document ID, exact required/allowed key allowlists (`hasAll`/`hasOnly` on create, `affectedKeys().hasOnly()` on update), `.size()` limits on all strings and lists, array element type validation on index 0, immutable `createdAt`, and server-enforced `request.time` timestamps.

## 2. The "Dirty Dozen" Adversarial Payloads (Must Return PERMISSION_DENIED)
1. **Unauthenticated Product Creation**: Anonymous visitor attempts `setDoc('/products/hack-1', validProduct)`.
2. **Non-Admin Authenticated Product Deletion**: Signed-in verified customer (`attacker@example.com`) attempts `deleteDoc('/products/prod-1')`.
3. **Unverified Admin Email Spoof**: Signed-in user with `email: 'bkralqary1@gmail.com'` and `email_verified: false` attempts `updateDoc('/siteConfig/main', ...)`.
4. **Privilege Escalation**: Authenticated user attempts `setDoc('/admins/' + uid, { email: 'attacker@example.com', role: 'admin' })`.
5. **Shadow Field Injection (Product)**: Admin attempts `setDoc('/products/prod-2', { ...validProduct, isHacked: true })`.
6. **ID Poisoning**: Admin attempts `setDoc('/products/../../evil!id', validProduct)`.
7. **String Length Overflow (DoW)**: Admin attempts to write a 5,000-character `nameAr` exceeding `maxLength: 200`.
8. **Array Overflow / Type Poisoning**: Admin attempts to write `images: [12345]` (non-string first element) or 25 image URLs (exceeding max 12).
9. **Client-Spoofed Timestamp**: Admin attempts `setDoc('/products/prod-3', { ...validProduct, createdAt: '2020-01-01T00:00:00Z' })` instead of `serverTimestamp()`.
10. **Immutable Field Mutation**: Admin attempts `updateDoc('/products/prod-1', { createdAt: serverTimestamp() })`.
11. **Unauthorized SiteConfig Document ID**: Admin attempts `setDoc('/siteConfig/other', validSiteConfig)` (only `main` is allowed).
12. **PII / Admin List Scraping**: Non-admin authenticated user attempts `getDocs('/admins')` or `getDoc('/admins/otherUid')`.
