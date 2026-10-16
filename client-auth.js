(function () {
  const storageKey = 'lakesideClientAccounts';
  const iterations = 150000;
  const encoder = new TextEncoder();

  function readAccounts() {
    const accounts = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (!Array.isArray(accounts)) {
      throw new Error('Saved client accounts are invalid. Clear this browser’s LakeSide client account data and register again.');
    }
    return accounts;
  }

  function bytesToBase64(bytes) {
    return btoa(String.fromCharCode(...bytes));
  }

  function base64ToBytes(value) {
    return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
  }

  async function hashPassword(password, salt) {
    if (!crypto.subtle) {
      throw new Error('Secure password storage requires a local web server or HTTPS.');
    }
    const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
    const derivedBits = await crypto.subtle.deriveBits({
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256'
    }, key, 256);
    return new Uint8Array(derivedBits);
  }

  async function createAccount(email, name, password) {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();
    const accounts = readAccounts();
    if (accounts.some((account) => account.email === normalizedEmail)) {
      throw new Error('An account with this email already exists. Sign in instead.');
    }

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const passwordHash = await hashPassword(password, salt);
    const account = {
      email: normalizedEmail,
      name: normalizedName,
      salt: bytesToBase64(salt),
      passwordHash: bytesToBase64(passwordHash)
    };
    accounts.push(account);
    localStorage.setItem(storageKey, JSON.stringify(accounts));
    return { email: account.email, name: account.name };
  }

  async function authenticate(email, password) {
    const normalizedEmail = email.trim().toLowerCase();
    const account = readAccounts().find((candidate) => candidate.email === normalizedEmail);
    if (!account) {
      throw new Error('No client account was found for this email. Create an account first.');
    }

    const actualHash = await hashPassword(password, base64ToBytes(account.salt));
    const expectedHash = base64ToBytes(account.passwordHash);
    const passwordMatches = actualHash.length === expectedHash.length &&
      actualHash.every((byte, index) => byte === expectedHash[index]);
    if (!passwordMatches) {
      throw new Error('The email or password is incorrect.');
    }

    return { email: account.email, name: account.name };
  }

  window.LakeSideClientAuth = { createAccount, authenticate };
})();
