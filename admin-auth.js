(function () {
  const bootstrapEmail = 'owinocliff328@gmail.com';
  const storageKey = 'lakesideAdminAccount';
  const iterations = 150000;
  const encoder = new TextEncoder();

  function getAccount() {
    const storedAccount = localStorage.getItem(storageKey);
    if (!storedAccount) return null;

    const account = JSON.parse(storedAccount);
    if (
      !account ||
      typeof account.email !== 'string' ||
      typeof account.salt !== 'string' ||
      typeof account.passwordHash !== 'string'
    ) {
      throw new Error('The saved admin account is invalid. Clear its browser data and set it up again.');
    }
    return account;
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

  async function saveAccount(email, password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const passwordHash = await hashPassword(password, salt);
    const account = {
      email: email.trim().toLowerCase(),
      salt: bytesToBase64(salt),
      passwordHash: bytesToBase64(passwordHash)
    };
    localStorage.setItem(storageKey, JSON.stringify(account));
    return account;
  }

  async function verifyPassword(account, password) {
    const actualHash = await hashPassword(password, base64ToBytes(account.salt));
    const expectedHash = base64ToBytes(account.passwordHash);
    return actualHash.length === expectedHash.length &&
      actualHash.every((byte, index) => byte === expectedHash[index]);
  }

  window.LakeSideAdminAuth = {
    bootstrapEmail,
    getAccount,
    saveAccount,
    verifyPassword
  };
})();
