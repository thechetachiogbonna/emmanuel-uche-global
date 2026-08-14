/**
 * ⚠️ NOT CRYPTOGRAPHICALLY SECURE.
 *
 * This is a client-side-only stand-in so passwords aren't stored as plain
 * text in localStorage during development. It is trivially reversible and
 * offers no real protection.
 *
 * Before real user accounts exist, passwords must be sent over HTTPS to a
 * server and hashed there with a proper algorithm (bcrypt, argon2, scrypt)
 * — never hashed or verified in the browser.
 */
export function mockHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0;
  }
  return `mock_${Math.abs(hash)}_${password.length}`;
}
